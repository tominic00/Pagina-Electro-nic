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
    
    // Obtener nombre desde el perfil de WhatsApp
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
    // 0) BUSCAR SI EL CLIENTE YA TIENE UN NOMBRE REGISTRADO EN LA BD
    // -------------------------------------------------------------
    const { data: clienteReg } = await supabase
      .from('clientes_mayorista')
      .select('*')
      .or(`telefono.eq.${numeroLimpio},telefono.eq.${remoteJid}`)
      .single();

    // Si ya lo tenemos guardado en BD, usamos su nombre guardado. Si no, usamos el pushName de WhatsApp o "amigo/a"
    const nombreClienteFinal = clienteReg?.nombre || pushName.trim() || 'amigo/a';

    // -------------------------------------------------------------
    // 1) COMANDO "MENU": REACTIVAR BOT Y CANCELAR PAUSA
    // -------------------------------------------------------------
    if (messageText.toLowerCase() === 'menu' || messageText.toLowerCase() === 'menú') {
      await supabase.from('bot_pausas').delete().eq('remote_jid', remoteJid);
      await supabase.from('clientes_mayorista').update({ bot_pausado_hasta: null }).eq('telefono', numeroLimpio);

      const msjReactivado = `🤖 ¡Bot reactivado, ${nombreClienteFinal}! ¿En qué te puedo ayudar hoy? Respóndeme con un número:\n\n1️⃣ Usados Impecables (% Batería)\n2️⃣ Nuevos Sellados\n3️⃣ Naves en Camino\n4️⃣ Comprar o Hablar con Vendedor 🛒`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, msjReactivado);
      return NextResponse.json({ status: 'bot_reactivado' });
    }

    // -------------------------------------------------------------
    // 2) VERIFICAR PAUSA TEMPORIZADA (60 MINUTOS)
    // -------------------------------------------------------------
    const { data: pausaTemp } = await supabase.from('bot_pausas').select('pausado_hasta').eq('remote_jid', remoteJid).single();
    const tiempoPausa = pausaTemp?.pausado_hasta || clienteReg?.bot_pausado_hasta;

    if (tiempoPausa && new Date(tiempoPausa) > new Date()) {
      return NextResponse.json({ status: 'bot_paused_for_human_intervention' });
    }

    // -------------------------------------------------------------
    // 3) RESPUESTA DEL DUEÑO SOBRE CITAS (FLUJO EXISTENTE)
    // -------------------------------------------------------------
    if (remoteJid === MI_WHATSAPP_PERSONAL) {
      const { data: ultimaCita } = await supabase
        .from('citas')
        .select('*')
        .eq('estado', 'pendiente')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (ultimaCita) {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || fallbackGroqKey });
        
        const decisionPrompt = `El dueño de la tienda respondió esto sobre la cita del cliente (${ultimaCita.cliente_nombre}): "${messageText}".
Determina qué decidió el dueño:
1. Si ACEPTÓ la cita tal cual, responde solo: CONFIRMAR
2. Si RECHAZÓ o PROPUSO OTRO HORARIO, escribe la respuesta educada que el bot debe mandarle al cliente notificándole la reprogramación.`;

        const resGroq = await groq.chat.completions.create({
          messages: [{ role: 'user', content: decisionPrompt }],
          model: 'llama-3.3-70b-versatile',
        });

        const decision = resGroq.choices[0]?.message?.content || '';

        if (decision.includes('CONFIRMAR')) {
          await supabase.from('citas').update({ estado: 'confirmada' }).eq('id', ultimaCita.id);
          await supabase.from('actividades').update({ estado: 'Completado' }).eq('cliente_telefono', ultimaCita.cliente_telefono);

          const mensajeCliente = `¡Hola ${ultimaCita.cliente_nombre}! 👋 Te confirmo que quedó agendada tu cita para ver el ${ultimaCita.equipo}. Te esperamos en el local (Florida Sur 24 local 2, Yerba Buena). ¡Nos vemos!`;
          await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, ultimaCita.cliente_telefono, mensajeCliente);
          await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, `✅ Cita de ${ultimaCita.cliente_nombre} confirmada y avisada al cliente.`);
        } else {
          await supabase.from('citas').update({ estado: 'reprogramada' }).eq('id', ultimaCita.id);
          await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, ultimaCita.cliente_telefono, decision);
          await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, `📩 Mensaje de cambio enviado a ${ultimaCita.cliente_nombre}.`);
        }

        return NextResponse.json({ success: true, mode: 'owner_intervention' });
      }
    }

    // -------------------------------------------------------------
    // 4) DETECCIÓN Y CLASIFICACIÓN PERMANENTE CON NOMBRE
    // -------------------------------------------------------------
    let tipoCliente = clienteReg?.tipo_cliente || null;

    if (!tipoCliente) {
      const textoLower = messageText.toLowerCase();

      if (messageText === '1' || textoLower.includes('mayorista') || textoLower.includes('revendedor') || textoLower.includes('comprar al por mayor') || textoLower.includes('local')) {
        tipoCliente = 'Mayorista';
        await guardarOActualizarCliente(supabase, remoteJid, numeroLimpio, nombreClienteFinal, 'Mayorista');
      } else if (messageText === '2' || textoLower.includes('minorista') || textoLower.includes('personal') || textoLower.includes('particular') || textoLower.includes('para mi')) {
        tipoCliente = 'Minorista';
        await guardarOActualizarCliente(supabase, remoteJid, numeroLimpio, nombreClienteFinal, 'Minorista');
      } else {
        // Mensaje de bienvenida personalizado con el nombre capturado
        const saludoInicial = nombreClienteFinal !== 'amigo/a' ? `¡Hola ${nombreClienteFinal}! 👋` : `¡Hola! 👋`;
        const mensajeBienvenida = `${saludoInicial} Bienvenido/a a *Electro·Nic*.\n\nPara brindarte la mejor información y la lista de precios adecuada, contame:\n\n1️⃣ *¿Buscás comprar al por mayor / para revender?* 💼\n2️⃣ *¿Buscás un equipo para uso personal?* 📱\n\n_Respondeme con el número 1 o 2 para continuar._`;
        
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, mensajeBienvenida);
        return NextResponse.json({ status: 'clasificacion_enviada' });
      }
    }

    // -------------------------------------------------------------
    // 5) ATENCIÓN A CLIENTES MAYORISTAS (PERSONALIZADO CON NOMBRE)
    // -------------------------------------------------------------
    if (tipoCliente === 'Mayorista') {
      
      if (messageText === '1' || messageText.toLowerCase().includes('usado')) {
        const { data: usados } = await supabase.from('stock_mayorista').select('*').eq('estado', 'Disponible').ilike('condicion', '%usado%');
        let listaUsados = `📱 *USADOS IMPECABLES EN STOCK MAYORISTA*\n\n`;
        usados?.forEach(u => {
          listaUsados += `• ${u.equipo} (Bat: ${u.bateria || 'N/A'}%) ➖ *U$D ${u.precio_venta_usd}*\n`;
        });
        listaUsados += "\n_Para comprar o reservar, responde '4' o 'Comprar'._";
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, listaUsados);
        return NextResponse.json({ success: true, mode: 'mayorista_usados' });
      }

      if (messageText === '2' || messageText.toLowerCase().includes('sellado') || messageText.toLowerCase().includes('nuevo')) {
        const { data: nuevos } = await supabase.from('stock_mayorista').select('*').eq('estado', 'Disponible').ilike('condicion', '%nuevo%');
        let listaNuevos = `✨ *NUEVOS SELLADOS EN STOCK MAYORISTA*\n\n`;
        nuevos?.forEach(n => {
          listaNuevos += `• ${n.equipo} ➖ *U$D ${n.precio_venta_usd}*\n`;
        });
        listaNuevos += "\n_Para comprar o reservar, responde '4' o 'Comprar'._";
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, listaNuevos);
        return NextResponse.json({ success: true, mode: 'mayorista_nuevos' });
      }

      if (messageText === '3' || messageText.toLowerCase().includes('camino') || messageText.toLowerCase().includes('nave')) {
        const { data: pedidos } = await supabase.from('pedidos_mayorista').select('*').eq('estado', 'En Camino');
        let listaCamino = `⏳ *NAVES EN CAMINO (LLEGANDO PRONTO)*\n\n`;
        pedidos?.forEach(p => {
          const items = p.items || [];
          items.forEach((it: any) => {
            listaCamino += `• ${it.modelo} ➖ *U$D ${it.precio_sugerido_usd || it.costo_usd}*\n`;
          });
        });
        listaCamino += "\n_Responde 'Comprar' para congelar precio y reservar._";
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, listaCamino);
        return NextResponse.json({ success: true, mode: 'mayorista_camino' });
      }

      if (messageText === '4' || messageText.toLowerCase().includes('comprar') || messageText.toLowerCase().includes('vendedor') || messageText.toLowerCase().includes('hablar')) {
        const fechaFinPausa = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await supabase.from('bot_pausas').upsert({ remote_jid: remoteJid, pausado_hasta: fechaFinPausa });
        await supabase.from('clientes_mayorista').update({ bot_pausado_hasta: fechaFinPausa }).eq('telefono', numeroLimpio);

        const msjPausa = `🤖 ¡De una ${nombreClienteFinal}! Te dejo en contacto directo con Tomi / nuestro equipo de ventas para coordinar los detalles de tu compra. En un instante te escribimos por acá.\n\n_(Si querés volver al menú automático antes, escribí **'Menú'**)_`;
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, msjPausa);

        const alertaAvisos = `🚨 *¡ALERTA DE VENTA MAYORISTA!* 🚨\n\n👤 *Cliente:* ${nombreClienteFinal} (+${numeroLimpio})\n💬 *Mensaje:* "${messageText}"\n\n⚠️ *El bot se pausó automáticamente durante 1 hora para que cierres la venta.*`;
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, alertaAvisos);

        return NextResponse.json({ success: true, mode: 'mayorista_vendedor_pausa' });
      }

      // Menú Principal Mayorista con Nombre
      const menuMayorista = `💼 *Menú Mayorista Electro·Nic*\n¡Hola ${nombreClienteFinal}! Elegí una opción para enviarte la info al instante:\n\n1️⃣ Usados Impecables (% Batería)\n2️⃣ Nuevos Sellados\n3️⃣ Naves en Camino\n4️⃣ Comprar o Hablar con Vendedor 👤`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, menuMayorista);
      return NextResponse.json({ success: true, mode: 'mayorista_menu' });
    }

    // -------------------------------------------------------------
    // 6) ATENCIÓN A CLIENTES MINORISTAS (GROQ IA CON NOMBRE)
    // -------------------------------------------------------------
    const { data: config } = await supabase.from('configuracion_ia').select('*').eq('id', 1).single();
    const groqKeyToUse = config?.groq_api_key || fallbackGroqKey;
    const groq = new Groq({ apiKey: groqKeyToUse });

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

    const { data: stockActual } = await supabase.from('stock_mayorista').select('*').eq('estado', 'Disponible');
    const stockFormateado = (stockActual || []).map(eq => 
      `- ${eq.equipo} | Condición: ${eq.condicion} | Bat: ${eq.bateria || 'N/A'}% | Precio Minorista: USD ${eq.precio_minorista_usd || eq.precio_venta_usd}`
    ).join("\n");

    // Inyectamos el nombre del cliente en el System Prompt para que la IA sepa con quién habla
    const promptBase = config?.system_prompt || `Sos el vendedor de Electro·Nic. INVENTARIO:\n{STOCK_DATA}`;
    const promptConNombre = `Estás hablando con el cliente llamado: ${nombreClienteFinal}.\n\n` + promptBase;
    const systemPromptFinal = promptConNombre.replace("{STOCK_DATA}", stockFormateado || "Sin stock disponible.");

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

    let aiReply = chatCompletion.choices[0]?.message?.content || `Hola ${nombreClienteFinal}, en un momento te atendemos.`;

    await supabase.from('mensajes_whatsapp').insert({
      remote_jid: remoteJid,
      role: 'ia',
      content: aiReply
    });

    // Detectar citas
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

      if (detalleCita && MI_WHATSAPP_PERSONAL !== remoteJid) {
        const mensajeAviso = `🚨 *¡NUEVA CITA MINORISTA PENDIENTE!* 🚨\n\n👤 *Cliente:* ${nombreClienteFinal} (+${numeroLimpio})\n📝 *Detalle:* ${detalleCita}\n\n👉 *Respondé este mensaje decidiendo:* \n- "Confirmado"\n- o el nuevo horario.`;
        await enviarRespuestaWA(evolutionUrl, evolutionApiKey, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, mensajeAviso);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error en WhatsApp:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

// 🚀 FUNCIÓN AUXILIAR PARA GUARDAR Y RECORDAR AL CLIENTE
async function guardarOActualizarCliente(supabase: any, remoteJid: string, telefono: string, nombre: string, tipo: 'Mayorista' | 'Minorista') {
  try {
    const { data: existente } = await supabase.from('clientes_mayorista').select('*').or(`telefono.eq.${telefono},telefono.eq.${remoteJid}`).single();

    if (existente) {
      await supabase.from('clientes_mayorista').update({ tipo_cliente: tipo, nombre: existente.nombre || nombre }).eq('id', existente.id);
    } else {
      await supabase.from('clientes_mayorista').insert([{
        nombre: nombre || 'Cliente',
        telefono,
        remote_jid: remoteJid,
        tipo_cliente: tipo,
        created_at: new Date().toISOString()
      }]);
    }
  } catch (e) {
    console.error("Error al registrar cliente con nombre:", e);
  }
}

// 🚀 FUNCIÓN DE ENVÍO
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