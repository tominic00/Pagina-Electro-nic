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
    // 0) REGISTRO Y BÚSQUEDA DEL CLIENTE
    // -------------------------------------------------------------
    const { data: clienteReg } = await supabase
      .from('clientes_mayorista')
      .select('*')
      .or(`telefono.eq.${numeroLimpio},telefono.eq.${remoteJid}`)
      .single();

    const nombreClienteFinal = clienteReg?.nombre || pushName.trim() || 'amigo/a';

    // -------------------------------------------------------------
    // 1) APROBACIÓN REMOTA POR EL DUEÑO ("Aprobar Mayorista...")
    // -------------------------------------------------------------
    if (remoteJid === MI_WHATSAPP_PERSONAL && messageText.toLowerCase().includes('aprobar mayorista')) {
      const numAprobar = messageText.replace(/aprobar mayorista/i, '').trim().replace(/[^0-9]/g, '');

      if (numAprobar) {
        await supabase.from('clientes_mayorista').update({ tipo_cliente: 'Mayorista', solicitando_mayorista: false }).or(`telefono.eq.${numAprobar},telefono.ilike.%${numAprobar}%`);

        const targetJid = numAprobar.includes('@') ? numAprobar : `${numAprobar}@s.whatsapp.net`;
        const msjAprobado = `🎉 ¡Buenas noticias ${nombreClienteFinal}! Tu cuenta fue habilitada como **Cliente Mayorista** en Electro·Nic.\n\nA partir de ahora tenés acceso a nuestras listas gremio, baterías detalladas y lotes en camino. ¿Qué modelos andás buscando para tu local?`;
        
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, targetJid, msjAprobado);
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, `✅ El cliente +${numAprobar} fue habilitado como MAYORISTA con éxito.`);

        return NextResponse.json({ success: true, mode: 'aprobacion_dueno_exitosa' });
      }
    }

    // -------------------------------------------------------------
    // 2) COMANDO "MENU": CANCELAR PAUSA
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
    // 4) SOLICITUD DE CAMBIO A MAYORISTA (FICHA COMERCIAL)
    // -------------------------------------------------------------
    const textoLower = messageText.toLowerCase();
    const quiereSerMayorista = textoLower.includes('quiero ser mayorista') || 
                              textoLower.includes('hacerme mayorista') || 
                              textoLower.includes('revendedor') || 
                              textoLower.includes('precio gremio');

    if (quiereSerMayorista && !clienteReg?.solicitando_mayorista && clienteReg?.tipo_cliente !== 'Mayorista') {
      await guardarOActualizarCliente(supabase, remoteJid, numeroLimpio, nombreClienteFinal, clienteReg?.tipo_cliente || 'Minorista', true);

      const msjFicha = `💼 ¡Excelente ${nombreClienteFinal}! Para validar tu perfil comercial y darte acceso a las listas mayoristas, pasame estos datos:\n\n1. Nombre y Apellido\n2. Email de contacto\n3. Nombre de tu Local o Negocio\n4. Usuario de Instagram / Redes\n\nApenas los envíes se los paso al dueño para habilitarte.`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, msjFicha);
      return NextResponse.json({ status: 'ficha_mayorista_solicitada' });
    }

    if (clienteReg?.solicitando_mayorista) {
      await supabase.from('clientes_mayorista').update({
        solicitando_mayorista: false,
        datos_solicitud: messageText
      }).eq('id', clienteReg.id);

      const msjConfirmacionCliente = `👍 ¡Ficha recibida, ${nombreClienteFinal}! Ya le envié tus datos al dueño para su validación. Apenas la apruebe te aviso por acá.`;
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
        const saludoInicial = nombreClienteFinal !== 'amigo/a' ? `¡Hola ${nombreClienteFinal}! 👋` : `¡Hola! 👋`;
        const mensajeBienvenida = `${saludoInicial} Bienvenido/a a *Electro·Nic*.\n\nPara pasarte la lista de precios adecuada, contame:\n\n1️⃣ **¿Buscás comprar al por mayor / para revender?** 💼\n2️⃣ **¿Buscás un equipo para uso personal?** 📱\n\n_Respondeme con el número 1 o 2 para continuar._`;
        
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, mensajeBienvenida);
        return NextResponse.json({ status: 'clasificacion_enviada' });
      }
    }

    // -------------------------------------------------------------
    // 6) ATENCIÓN DIRECTA POR HUMANO (PAUSA DEL BOT)
    // -------------------------------------------------------------
    if (textoLower.includes('vendedor') || textoLower.includes('hablar con el dueño') || textoLower.includes('hablar con un vendedor') || textoLower.includes('humano')) {
      const fechaFinPausa = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await supabase.from('bot_pausas').upsert({ remote_jid: remoteJid, pausado_hasta: fechaFinPausa });
      await supabase.from('clientes_mayorista').update({ bot_pausado_hasta: fechaFinPausa }).eq('telefono', numeroLimpio);

      const msjPausa = `👥 ¡De una ${nombreClienteFinal}! Le acabo de avisar a Tomi y al equipo de ventas para que te atiendan personalmente por este chat. En breve te escribimos por acá.\n\n_(El asistente se pausará durante 1 hora. Escribí **'Menú'** si querés reactivar el bot antes)._`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, msjPausa);

      const alertaAvisos = `🚨 *¡SOLICITUD DE ATENCIÓN DIRECTA!* 🚨\n\n👤 *Cliente:* ${nombreClienteFinal} (+${numeroLimpio})\n💬 *Mensaje:* "${messageText}"\n\n⚠️ *El bot se pausó automáticamente durante 1 hora.*`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, alertaAvisos);

      return NextResponse.json({ success: true, mode: 'vendedor_pausa' });
    }

    // -------------------------------------------------------------
    // 🧠 7) ATENCIÓN CON IA GROQ (DETERMINACIÓN CONTEXTUAL INTELIGENTE)
    // -------------------------------------------------------------
    const { data: config } = await supabase.from('configuracion_ia').select('*').eq('id', 1).single();
    const groqKeyToUse = config?.groq_api_key || fallbackGroqKey;
    const groq = new Groq({ apiKey: groqKeyToUse });

    // Guardar mensaje del usuario
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

    // Traer stock físico y formatear BATERÍAS DIVERSAS
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
        lotesFormateados += `- Nave/Lote en camino: ${it.modelo} (${it.condicion || 'Nuevo'}) | Precio Reserva: USD ${it.precio_sugerido_usd || it.costo_usd}\n`;
      });
    });

    // SYSTEM PROMPT MAYORISTA DINÁMICO
    let systemPromptFinal = "";

    if (tipoCliente === 'Mayorista') {
      systemPromptFinal = `Sos el asesor comercial ejecutivo de Electro·Nic (Tucumán). Atendés por WhatsApp a CLIENTES MAYORISTAS Y REVENDEDORES.

REGLAS DE ATENCIÓN CONTEXTUAL INTELIGENTE:
1. Cliente actual: ${nombreClienteFinal}.
2. TONO Y ESTILO: Hablá en argentino fluido, cercano y comercial ('vos', 'de una', 'te cuento', 'fijate'). Mantené respuestas concisas (máximo 3 o 4 oraciones).
3. MANEJO DE INVENTARIO Y BATERÍAS:
   - Cuando el cliente pida ver la lista de USADOS, agrupá los modelos inteligentemente y detallá los % de baterías disponibles que tenés en el inventario de abajo (ej: "iPhone 14 (128GB) en USD 300 con baterías entre el 88% y 93%").
   - NUNCA digas "batería a consultar" si en el inventario de abajo tenés el valor numérico.
4. OPCIONES ADAPTATIVAS Y CONTEXTUALES AL PIE:
   Al finalizar CADA respuesta, agregá un breve bloque de opciones QUE TENGAN SENTIDO CON LO QUE ACABAN DE HABLAR:
   
   * Si le acabás de mostrar los USADOS:
     ---
     📌 *Pasos siguientes:*
     ▫️ Para encargar o reservar unidades: Decime cuáles querés o escribí *'Comprar'*.
     ▫️ Para ver *Nuevos Sellados* o *Lotes en Camino*, pedímelos directamente.
     ▫️ Para hablar con un asesor humano: Escribí *'Vendedor'*.
     ▫️ Para reiniciar el menú: Escribí *'Menú'*.

   * Si es un saludo inicial o consulta libre:
     ---
     📌 *Opciones del Catálogo Mayorista:*
     1️⃣ **Ver Stock Usados y Baterías**
     2️⃣ **Ver Nuevos Sellados**
     3️⃣ **Ver Lotes en Tránsito**
     4️⃣ **Hablar con un Vendedor** 🛒

INVENTARIO STOCK FÍSICO REAL EN SUPABASE:
${stockFormateado || "Actualmente sin stock físico disponible."}

LOTES EN CAMINO (RESERVAS):
${lotesFormateados || "No hay lotes en tránsito actualmente."}`;
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
      temperature: 0.3,
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

// 🚀 ENVÍO CON EVOLUTION API
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