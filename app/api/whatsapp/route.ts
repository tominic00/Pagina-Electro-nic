import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const MI_WHATSAPP_PERSONAL = '5493815944101@s.whatsapp.net';
const INSTANCE_NAME = 'electro-nic-cel-bot';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.data?.key?.fromMe) {
      return NextResponse.json({ status: 'ignored' });
    }

    const messageText = (body.data?.message?.conversation || 
                        body.data?.message?.extendedTextMessage?.text || "").trim();
    const remoteJid = body.data?.key?.remoteJid;
    let pushName = body.data?.pushName || '';

    if (!messageText || !remoteJid) {
      return NextResponse.json({ status: 'no_message_data' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const fallbackGroqKey = process.env.GROQ_API_KEY;
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Falta configuración de Supabase' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const numeroLimpio = remoteJid.replace('@s.whatsapp.net', '');

    // -------------------------------------------------------------
    // 0) OBTENER DATOS Y REGISTRO DEL CLIENTE EN SUPABASE
    // -------------------------------------------------------------
    const { data: clienteReg } = await supabase
      .from('clientes_mayorista')
      .select('*')
      .or(`telefono.eq.${numeroLimpio},telefono.eq.${remoteJid}`)
      .single();

    const nombreClienteFinal = clienteReg?.nombre || pushName.trim() || 'Estimado/a';

    // -------------------------------------------------------------
    // 1) APROBACIÓN REMOTA POR EL DUEÑO ("Aprobar Mayorista...")
    // -------------------------------------------------------------
    if (remoteJid === MI_WHATSAPP_PERSONAL && messageText.toLowerCase().includes('aprobar mayorista')) {
      const numAprobar = messageText.replace(/aprobar mayorista/i, '').trim().replace(/[^0-9]/g, '');

      if (numAprobar) {
        await supabase.from('clientes_mayorista').update({ tipo_cliente: 'Mayorista', solicitando_mayorista: false }).or(`telefono.eq.${numAprobar},telefono.ilike.%${numAprobar}%`);

        const targetJid = numAprobar.includes('@') ? numAprobar : `${numAprobar}@s.whatsapp.net`;
        const msjAprobado = `🏛️ *ELECTRO·NIC B2B — CUENTA MAYORISTA APROBADA*\n\n¡Buenas noticias, ${nombreClienteFinal}! Tu cuenta fue dada de alta con éxito como **Cliente Mayorista**.\n\nA partir de ahora tenés acceso a nuestro stock físico, baterías detalladas y precios congelados en lotes en camino. ¿Qué equipos estás buscando para tu local?`;
        
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, targetJid, msjAprobado);
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, `✅ El cliente +${numAprobar} fue habilitado como MAYORISTA.`);

        return NextResponse.json({ success: true, mode: 'aprobacion_dueno_exitosa' });
      }
    }

    // -------------------------------------------------------------
    // 2) COMANDO "MENU": CANCELAR PAUSA O REINICIAR
    // -------------------------------------------------------------
    if (messageText.toLowerCase() === 'menu' || messageText.toLowerCase() === 'menú') {
      await supabase.from('bot_pausas').delete().eq('remote_jid', remoteJid);
      await supabase.from('clientes_mayorista').update({ bot_pausado_hasta: null }).eq('telefono', numeroLimpio);
    }

    // -------------------------------------------------------------
    // 3) VERIFICAR PAUSA TEMPORIZADA DE 60 MINUTOS
    // -------------------------------------------------------------
    const { data: pausaTemp } = await supabase.from('bot_pausas').select('pausado_hasta').eq('remote_jid', remoteJid).single();
    const tiempoPausa = pausaTemp?.pausado_hasta || clienteReg?.bot_pausado_hasta;

    if (tiempoPausa && new Date(tiempoPausa) > new Date()) {
      return NextResponse.json({ status: 'bot_paused_for_human_intervention' });
    }

    // -------------------------------------------------------------
    // 4) SOLICITUD DE PASO A MAYORISTA (FICHA COMERCIAL)
    // -------------------------------------------------------------
    const textoLower = messageText.toLowerCase();
    const quiereSerMayorista = textoLower.includes('quiero ser mayorista') || 
                              textoLower.includes('hacerme mayorista') || 
                              textoLower.includes('revendedor') || 
                              textoLower.includes('precio gremio');

    if (quiereSerMayorista && !clienteReg?.solicitando_mayorista && clienteReg?.tipo_cliente !== 'Mayorista') {
      await guardarOActualizarCliente(supabase, remoteJid, numeroLimpio, nombreClienteFinal, clienteReg?.tipo_cliente || 'Minorista', true);

      const msjFicha = `💼 *ALTA DE CUENTA MAYORISTA B2B*\n\n¡Excelente ${nombreClienteFinal}! Para validar tu perfil comercial y darte acceso a las listas gremio, pasame estos datos:\n\n1. Nombre y Apellido\n2. Email de contacto\n3. Nombre de tu Local o Negocio\n4. Instagram / Redes Sociales\n\nApenas nos envíes estos datos se los mando al dueño para su aprobación.`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, msjFicha);
      return NextResponse.json({ status: 'ficha_mayorista_solicitada' });
    }

    if (clienteReg?.solicitando_mayorista) {
      await supabase.from('clientes_mayorista').update({
        solicitando_mayorista: false,
        datos_solicitud: messageText
      }).eq('id', clienteReg.id);

      const msjConfirmacionCliente = `👍 ¡Ficha recibida, ${nombreClienteFinal}! Ya le envié tus datos al dueño para su validación. Apenas la apruebe te aviso por acá para mostrarte todo el stock.`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, msjConfirmacionCliente);

      const msjAlertaDueno = `🚨 *SOLICITUD DE ALTA MAYORISTA B2B* 🚨\n\n👤 *Cliente:* ${nombreClienteFinal} (+${numeroLimpio})\n📝 *Ficha:* "${messageText}"\n\n👉 *Para aprobar, respondé:* \nAprobar Mayorista ${numeroLimpio}`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, msjAlertaDueno);

      return NextResponse.json({ status: 'solicitud_mayorista_enviada' });
    }

    // -------------------------------------------------------------
    // 5) CLASIFICACIÓN INICIAL (NUEVOS CONTACTOS)
    // -------------------------------------------------------------
    let tipoCliente = clienteReg?.tipo_cliente || null;

    if (!tipoCliente) {
      if (messageText === '1' || textoLower.includes('mayorista') || textoLower.includes('revendedor')) {
        tipoCliente = 'Mayorista';
        await guardarOActualizarCliente(supabase, remoteJid, numeroLimpio, nombreClienteFinal, 'Mayorista', false);
      } else if (messageText === '2' || textoLower.includes('minorista') || textoLower.includes('personal')) {
        tipoCliente = 'Minorista';
        await guardarOActualizarCliente(supabase, remoteJid, numeroLimpio, nombreClienteFinal, 'Minorista', false);
      } else {
        const saludoInicial = nombreClienteFinal !== 'Estimado/a' ? `¡Hola ${nombreClienteFinal}! 👋` : `¡Hola! 👋`;
        const mensajeBienvenida = `${saludoInicial} Bienvenido/a a *Electro·Nic*.\n\nPara pasarte los precios correctos, contame:\n\n1️⃣ **¿Buscás comprar al por mayor / para revender?** 💼\n2️⃣ **¿Buscás un equipo para uso personal?** 📱\n\n_Respondeme con el número 1 o 2 para continuar._`;
        
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, mensajeBienvenida);
        return NextResponse.json({ status: 'clasificacion_enviada' });
      }
    }

    // -------------------------------------------------------------
    // 6) INTERRUPCIÓN HUMANA: SOLICITUD DE VENDEDOR O COMPRA DIRECTA
    // -------------------------------------------------------------
    if (textoLower.includes('comprar') || textoLower.includes('vendedor') || textoLower.includes('hablar con el dueño') || textoLower.includes('humano')) {
      const fechaFinPausa = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await supabase.from('bot_pausas').upsert({ remote_jid: remoteJid, pausado_hasta: fechaFinPausa });
      await supabase.from('clientes_mayorista').update({ bot_pausado_hasta: fechaFinPausa }).eq('telefono', numeroLimpio);

      const msjPausa = `👥 ¡De una ${nombreClienteFinal}! Le acabo de avisar a Tomi y al equipo de ventas para que te atiendan personalmente por este chat. En un toque te responden.\n\n_(El asistente se pausará durante 1 hora. Escribí **'Menú'** si querés reactivar el bot antes)._`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, msjPausa);

      const alertaAvisos = `🚨 *¡SOLICITUD DE ATENCIÓN DIRECTA!* 🚨\n\n👤 *Cliente:* ${nombreClienteFinal} (+${numeroLimpio})\n💬 *Mensaje:* "${messageText}"\n\n⚠️ *El bot se pausó automáticamente durante 1 hora.*`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, alertaAvisos);

      return NextResponse.json({ success: true, mode: 'vendedor_pausa' });
    }

    // -------------------------------------------------------------
    // 🧠 7) ATENCIÓN CON IA GROQ (TANTO MAYORISTA COMO MINORISTA)
    // -------------------------------------------------------------
    const { data: config } = await supabase.from('configuracion_ia').select('*').eq('id', 1).single();
    const groqKeyToUse = config?.groq_api_key || fallbackGroqKey;
    const groq = new Groq({ apiKey: groqKeyToUse });

    // Guardar mensaje en el historial
    await supabase.from('mensajes_whatsapp').insert({
      remote_jid: remoteJid,
      role: 'user',
      content: messageText
    });

    const { data: historialPrevio } = await supabase
      .from('mensajes_whatsapp')
      .select('role, content')
      .eq('remote_jid', remoteJid)
      .order('id', { ascending: false })
      .limit(6);

    const mensajesOrdenados = (historialPrevio || []).reverse();

    // Traer stock físico y formatear CON BATERÍAS REALES
    const { data: stockActual } = await supabase.from('stock_mayorista').select('*').eq('estado', 'Disponible');
    
    const stockFormateado = (stockActual || []).map(eq => {
      const batVal = eq.bateria || eq.porcentaje_bateria || eq.bat || 'N/A';
      const precioUsd = tipoCliente === 'Mayorista' ? (eq.precio_venta_usd || eq.costo_usd) : (eq.precio_minorista_usd || eq.precio_venta_usd);
      return `- ${eq.equipo} | Condición: ${eq.condicion || 'Usado'} | Batería: ${batVal}% | Precio USD: ${precioUsd}`;
    }).join("\n");

    // Traer lotes en camino
    const { data: lotesCamino } = await supabase.from('pedidos_mayorista').select('*').eq('estado', 'En Camino');
    let lotesFormateados = "";
    lotesCamino?.forEach(l => {
      l.items?.forEach((it: any) => {
        lotesFormateados += `- Lote en camino: ${it.modelo} (${it.condicion || 'Nuevo'}) | Precio Reserva: USD ${it.precio_sugerido_usd || it.costo_usd}\n`;
      });
    });

    // SYSTEM PROMPT SEGÚN EL TIPO DE CLIENTE
    let systemPromptFinal = "";

    if (tipoCliente === 'Mayorista') {
      systemPromptFinal = `Sos el asesor comercial ejecutivo de Electro·Nic (Tucumán). Atendés a CLIENTES MAYORISTAS / REVENDEDORES por WhatsApp.

REGLAS DE ATENCIÓN MAYORISTA:
1. Cliente con el que hablás: ${nombreClienteFinal}.
2. Tono profesional pero cercano y conversacional (usá 'vos', 'te cuento', 'fijate', 'de una'). RESPUESTAS CORTAS (máximo 3 oraciones).
3. Entendé cualquier consulta abierta: si saludan, devolvé el saludo amablemente. Si preguntan por baterías, pasale las baterías exactas del inventario. Si preguntan formas de pago, aclará que recibimos USDT, USD Billete físico y Pesos al cambio del día.
4. NUNCA respondas con menús rígidos de números a menos que te pidan "menú" o "lista".
5. Si quieren cerrar pedido o hablar con un humano, deciles que pongan "Comprar" o "Vendedor" y los derivás directo con el dueño.

INVENTARIO EN STOCK FÍSICO (MAYORISTA):
${stockFormateado || "Actualmente sin stock físico disponible."}

LOTES EN CAMINO (PARA RESERVAR):
${lotesFormateados || "No hay lotes en tránsito por el momento."}`;
    } else {
      const promptBase = config?.system_prompt || `Sos el vendedor de Electro·Nic. INVENTARIO:\n{STOCK_DATA}`;
      const promptConNombre = `Estás hablando con el cliente MINORISTA llamado: ${nombreClienteFinal}.\n\n` + promptBase;
      systemPromptFinal = promptConNombre.replace("{STOCK_DATA}", stockFormateado || "Sin stock disponible.");
    }

    const messagesForGroq = [
      { role: 'system', content: systemPromptFinal },
      ...mensajesOrdenados.map(m => ({
        role: m.role === 'ia' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messagesForGroq as any,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
    });

    let aiReply = chatCompletion.choices[0]?.message?.content || `Hola ${nombreClienteFinal}, ¿en qué te puedo ayudar hoy?`;

    await supabase.from('mensajes_whatsapp').insert({
      remote_jid: remoteJid,
      role: 'ia',
      content: aiReply
    });

    // Detectar citas (Minoristas)
    const matchCita = aiReply.match(/\[AGENDAR_CITA:\s*(.*?)\]/i);
    let detalleCita = '';

    if (matchCita) {
      detalleCita = matchCita[1];
      aiReply = aiReply.replace(/\[AGENDAR_CITA:\s*.*?\]/i, '').trim();

      await supabase.from('citas').insert({
        cliente_nombre: nombreClienteFinal,
        cliente_telefono: remoteJid,
        equipo: detalleCita,
        fecha_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        estado: 'pendiente'
      });

      await supabase.from('actividades').insert({
        titulo: `Cita con ${nombreClienteFinal} (${detalleCita})`,
        tipo: 'Cita',
        descripcion: `Solicitado vía WhatsApp por +${numeroLimpio}`,
        fecha: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        estado: 'Pendiente',
        cliente_telefono: remoteJid
      });
    }

    if (evolutionUrl && evolutionApiKey) {
      await enviarRespuestaWA(evolutionUrl, evolutionApiKey, INSTANCE_NAME, remoteJid, aiReply);

      if (detalleCita) {
        const mensajeAviso = `🚨 *¡NUEVA CITA PENDIENTE!* 🚨\n\n👤 *Cliente:* ${nombreClienteFinal} (+${numeroLimpio})\n📝 *Detalle:* ${detalleCita}\n\n👉 *Respondé este mensaje decidiendo:* \n- "Confirmado"\n- o el nuevo horario.`;
        await enviarRespuestaWA(evolutionUrl, evolutionApiKey, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, mensajeAviso);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error en WhatsApp:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

// 🚀 GUARDADO Y ACTUALIZACIÓN DE CLIENTES
async function guardarOActualizarCliente(supabase: any, remoteJid: string, telefono: string, nombre: string, tipo: 'Mayorista' | 'Minorista', solicitandoMayorista: boolean = false) {
  try {
    const { data: existente } = await supabase.from('clientes_mayorista').select('*').or(`telefono.eq.${telefono},telefono.eq.${remoteJid}`).single();

    if (existente) {
      await supabase.from('clientes_mayorista').update({
        tipo_cliente: tipo,
        nombre: existente.nombre || nombre,
        solicitando_mayorista: solicitandoMayorista
      }).eq('id', existente.id);
    } else {
      await supabase.from('clientes_mayorista').insert([{
        nombre: nombre || 'Cliente',
        telefono,
        remote_jid: remoteJid,
        tipo_cliente: tipo,
        solicitando_mayorista: solicitandoMayorista,
        created_at: new Date().toISOString()
      }]);
    }
  } catch (e) {
    console.error("Error al registrar cliente:", e);
  }
}

// 🚀 FUNCIÓN DE ENVÍO EVOLUTION API
async function enviarRespuestaWA(url: string, key: string, instancia: string, numero: string, texto: string) {
  try {
    await fetch(`${url}/message/sendText/${instancia}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': key },
      body: JSON.stringify({ number: numero, text: texto })
    });
  } catch (e) {
    console.error("Error enviando WhatsApp:", e);
  }
}