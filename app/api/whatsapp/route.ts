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
    // 0) OBTENER DATOS Y REGISTRO DEL CLIENTE
    // -------------------------------------------------------------
    const { data: clienteReg } = await supabase
      .from('clientes_mayorista')
      .select('*')
      .or(`telefono.eq.${numeroLimpio},telefono.eq.${remoteJid}`)
      .single();

    const nombreClienteFinal = clienteReg?.nombre || pushName.trim() || 'Estimado/a';

    // -------------------------------------------------------------
    // 1) APROBACIÓN REMOTA POR EL DUEÑO
    // -------------------------------------------------------------
    if (remoteJid === MI_WHATSAPP_PERSONAL && messageText.toLowerCase().includes('aprobar mayorista')) {
      const numAprobar = messageText.replace(/aprobar mayorista/i, '').trim().replace(/[^0-9]/g, '');

      if (numAprobar) {
        await supabase.from('clientes_mayorista').update({ tipo_cliente: 'Mayorista', solicitando_mayorista: false }).or(`telefono.eq.${numAprobar},telefono.ilike.%${numAprobar}%`);

        const targetJid = numAprobar.includes('@') ? numAprobar : `${numAprobar}@s.whatsapp.net`;
        const msjAprobado = `🏛️ *ELECTRO·NIC B2B — ALTA DE CUENTA APROBADA*\n\nEstimado/a *${nombreClienteFinal}*, le notificamos que su cuenta fue validada con éxito como **Cliente Mayorista**.\n\nA partir de este momento cuenta con acceso a nuestro inventario en tiempo real, cotizaciones gremio y lotes en tránsito.\n\nEscriba *'Menú'* en cualquier momento para desplegar el panel de listas.`;
        
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, targetJid, msjAprobado);
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, `✅ El cliente +${numAprobar} fue habilitado como MAYORISTA con éxito.`);

        return NextResponse.json({ success: true, mode: 'aprobacion_dueno_exitosa' });
      }
    }

    // -------------------------------------------------------------
    // 2) COMANDO "MENU": DESPLEGAR PANEL EJECUTIVO
    // -------------------------------------------------------------
    if (messageText.toLowerCase() === 'menu' || messageText.toLowerCase() === 'menú') {
      await supabase.from('bot_pausas').delete().eq('remote_jid', remoteJid);
      await supabase.from('clientes_mayorista').update({ bot_pausado_hasta: null }).eq('telefono', numeroLimpio);

      const msjReactivado = `🏛️ *ELECTRO·NIC — DISTRIBUCIÓN MAYORISTA*\n\nEstimado/a *${nombreClienteFinal}*, seleccione la opción requerida respondiendo con el número correspondiente:\n\n1️⃣ *Stock Usados Selección* (% Baterías)\n2️⃣ *Stock Nuevos Sellados* (Garantía Oficial)\n3️⃣ *Equipos en Camino* (Precios de Reserva)\n4️⃣ **Atención Comercial Directa** / *Comprar* 🛍️`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, msjReactivado);
      return NextResponse.json({ status: 'bot_reactivado' });
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
    // 4) CAPTURA DE SOLICITUD MAYORISTA
    // -------------------------------------------------------------
    const textoLower = messageText.toLowerCase();
    const quiereSerMayorista = textoLower.includes('mayorista') || 
                              textoLower.includes('revendedor') || 
                              textoLower.includes('reventa') || 
                              textoLower.includes('precio gremio') || 
                              textoLower.includes('por mayor');

    if (quiereSerMayorista && !clienteReg?.solicitando_mayorista && clienteReg?.tipo_cliente !== 'Mayorista') {
      await guardarOActualizarCliente(supabase, remoteJid, numeroLimpio, nombreClienteFinal, clienteReg?.tipo_cliente || 'Minorista', true);

      const msjFicha = `💼 *SOLICITUD DE CUENTA MAYORISTA B2B*\n\nEstimado/a *${nombreClienteFinal}*, para validar su perfil comercial y habilitar la lista de precios gremio, le solicitamos nos brinde los siguientes datos:\n\n1. Nombre y Apellido Completo\n2. Correo Electrónico Corporativo\n3. Nombre comercial de su Local o Empresa\n4. Usuario de Instagram / Redes Sociales\n\n_Por favor, responda a este mensaje con los datos completos para ser evaluado por la gerencia comercial._`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, msjFicha);
      return NextResponse.json({ status: 'ficha_mayorista_solicitada' });
    }

    if (clienteReg?.solicitando_mayorista) {
      await supabase.from('clientes_mayorista').update({
        solicitando_mayorista: false,
        datos_solicitud: messageText
      }).eq('id', clienteReg.id);

      const msjConfirmacionCliente = `📋 *SOLICITUD EN PROCESO DE EVALUACIÓN*\n\nGracias *${nombreClienteFinal}*. Hemos recibido su información comercial. Su solicitud ha sido enviada a gerencia. Tan pronto como sea aprobada, recibirá la notificación de confirmación en este chat.`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, msjConfirmacionCliente);

      const msjAlertaDueno = `🚨 *SOLICITUD DE ALTA MAYORISTA B2B* 🚨\n\n👤 *Cliente:* ${nombreClienteFinal} (+${numeroLimpio})\n📝 *Ficha Comercial:* "${messageText}"\n\n👉 *Para aprobar, responda escribiendo exactamente:*\nAprobar Mayorista ${numeroLimpio}`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, msjAlertaDueno);

      return NextResponse.json({ status: 'solicitud_mayorista_enviada' });
    }

    // -------------------------------------------------------------
    // 5) CLASIFICACIÓN INICIAL (NUEVOS CONTACTOS)
    // -------------------------------------------------------------
    let tipoCliente = clienteReg?.tipo_cliente || null;

    if (!tipoCliente) {
      if (messageText === '1') {
        tipoCliente = 'Mayorista';
        await guardarOActualizarCliente(supabase, remoteJid, numeroLimpio, nombreClienteFinal, 'Mayorista', false);
      } else if (messageText === '2') {
        tipoCliente = 'Minorista';
        await guardarOActualizarCliente(supabase, remoteJid, numeroLimpio, nombreClienteFinal, 'Minorista', false);
      } else {
        const saludoInicial = nombreClienteFinal !== 'Estimado/a' ? `¡Bienvenido/a *${nombreClienteFinal}* a *Electro·Nic*!` : `¡Bienvenido/a a *Electro·Nic*!`;
        const mensajeBienvenida = `${saludoInicial}\n\nPara dirigirlo/a con el área correspondiente, por favor indique su perfil de compra:\n\n1️⃣ **Compra Mayorista / Revendedor** 💼\n2️⃣ **Compra Minorista / Uso Personal** 📱\n\n_Responda con el número 1 o 2 para continuar._`;
        
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, mensajeBienvenida);
        return NextResponse.json({ status: 'clasificacion_enviada' });
      }
    }

    // -------------------------------------------------------------
    // 6) ATENCIÓN EJECUTIVA A CLIENTES MAYORISTAS
    // -------------------------------------------------------------
    if (tipoCliente === 'Mayorista') {
      
      // OPCIÓN 1: USADOS IMPECABLES AGRUPADOS CON FORMATO PROFESIONAL
      if (messageText === '1' || messageText.toLowerCase().includes('usado')) {
        const { data: usados } = await supabase.from('stock_mayorista').select('*').eq('estado', 'Disponible').ilike('condicion', '%usado%');
        
        // Agrupar por modelo/equipo y precio
        const agrupados: Record<string, { cantidad: number; precio: number; baterias: string[] }> = {};
        
        usados?.forEach(u => {
          const key = `${u.equipo}`;
          if (!agrupados[key]) {
            agrupados[key] = { cantidad: 0, precio: Number(u.precio_venta_usd), baterias: [] };
          }
          agrupados[key].cantidad += 1;
          if (u.bateria) agrupados[key].baterias.push(`${u.bateria}%`);
        });

        let listaUsados = `📱 *CATÁLOGO DE USADOS SELECCIONADOS (MAYORISTA)*\n\n`;

        if (Object.keys(agrupados).length === 0) {
          listaUsados += `_Actualmente no disponemos de unidades usadas en stock físico. Consulte lotes en tránsito._\n\n`;
        } else {
          Object.entries(agrupados).forEach(([modelo, info]) => {
            const batTexto = info.baterias.length > 0 ? info.baterias.join(', ') : 'Consultar';
            listaUsados += `▫️ *${modelo}*\n  • Disponibles: *${info.cantidad} ud(s).*\n  • Bat: *${batTexto}*\n  • Precio Mayorista: *USD ${info.precio}*\n\n`;
          });
        }

        listaUsados += `──────────────────────────\n📌 *¿CÓMO DESEÁS CONTINUAR?*\n▫️ Para reservar o comprar: Respondé *4* o *'Comprar'*.\n▫️ Para volver al menú principal: Respondé *Menú*.\n▫️ Para hablar con un asesor: Respondé *Vendedor*.`;
        
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, listaUsados);
        return NextResponse.json({ success: true, mode: 'mayorista_usados' });
      }

      // OPCIÓN 2: NUEVOS SELLADOS AGRUPADOS
      if (messageText === '2' || messageText.toLowerCase().includes('sellado') || messageText.toLowerCase().includes('nuevo')) {
        const { data: nuevos } = await supabase.from('stock_mayorista').select('*').eq('estado', 'Disponible').ilike('condicion', '%nuevo%');
        
        const agrupados: Record<string, { cantidad: number; precio: number }> = {};
        
        nuevos?.forEach(n => {
          const key = `${n.equipo}`;
          if (!agrupados[key]) {
            agrupados[key] = { cantidad: 0, precio: Number(n.precio_venta_usd) };
          }
          agrupados[key].cantidad += 1;
        });

        let listaNuevos = `✨ *CATÁLOGO DE NUEVOS SELLADOS (GARANTÍA OFICIAL)*\n\n`;

        if (Object.keys(agrupados).length === 0) {
          listaNuevos += `_Sin unidades selladas en stock físico en este momento._\n\n`;
        } else {
          Object.entries(agrupados).forEach(([modelo, info]) => {
            listaNuevos += `▫️ *${modelo}*\n  • Stock: *${info.cantidad} ud(s).*\n  • Precio Mayorista: *USD ${info.precio}*\n\n`;
          });
        }

        listaNuevos += `──────────────────────────\n📌 *¿CÓMO DESEÁS CONTINUAR?*\n▫️ Para reservar o comprar: Respondé *4* o *'Comprar'*.\n▫️ Para volver al menú principal: Respondé *'Menú'*.\n▫️ Para hablar con un asesor: Respondé *'Vendedor'*.`;
        
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, listaNuevos);
        return NextResponse.json({ success: true, mode: 'mayorista_nuevos' });
      }

      // OPCIÓN 3: LOTES EN TRÁNSITO
      if (messageText === '3' || messageText.toLowerCase().includes('camino') || messageText.toLowerCase().includes('nave')) {
        const { data: pedidos } = await supabase.from('pedidos_mayorista').select('*').eq('estado', 'En Camino');
        
        let listaCamino = `⏳ *LOTES Y NAVES EN TRÁNSITO (PRÓXIMO INGRESO)*\n\n`;
        let hayItems = false;

        pedidos?.forEach(p => {
          const items = p.items || [];
          items.forEach((it: any) => {
            hayItems = true;
            listaCamino += `▫️ *${it.modelo}* (${it.condicion || 'Nuevo'})\n  • Cantidad Lote: *${it.cantidad} ud(s).*\n  • Precio Congelado: *USD ${it.precio_sugerido_usd || it.costo_usd}*\n\n`;
          });
        });

        if (!hayItems) {
          listaCamino += `_No hay lotes en tránsito en este momento._\n\n`;
        }

        listaCamino += `──────────────────────────\n📌 *¿CÓMO DESEÁS CONTINUAR?*\n▫️ Para congelar precio y reservar: Respondé *4* o *'Comprar'*.\n▫️ Para volver al menú principal: Respondé *'Menú'*.\n▫️ Para hablar con un asesor: Respondé *'Vendedor'*.`;
        
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, listaCamino);
        return NextResponse.json({ success: true, mode: 'mayorista_camino' });
      }

      // OPCIÓN 4: COMPRA O ASESORÍA
      if (messageText === '4' || messageText.toLowerCase().includes('comprar') || messageText.toLowerCase().includes('vendedor') || messageText.toLowerCase().includes('hablar')) {
        const fechaFinPausa = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        await supabase.from('bot_pausas').upsert({ remote_jid: remoteJid, pausado_hasta: fechaFinPausa });
        await supabase.from('clientes_mayorista').update({ bot_pausado_hasta: fechaFinPausa }).eq('telefono', numeroLimpio);

        const msjPausa = `👥 *ATENCIÓN COMERCIAL DIRECTA*\n\nEstimado/a *${nombreClienteFinal}*, lo hemos derivado con un asesor de ventas para coordinar los detalles de su pedido.\n\nEn breve se comunicarán con usted por este canal.\n\n_Nota: El bot automático permanecerá pausado. Si desea reactivarlo antes de 1 hora, responda *'Menú'*._`;
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, msjPausa);

        const alertaAvisos = `🚨 *¡SOLICITUD DE ATENCIÓN MAYORISTA!* 🚨\n\n👤 *Cliente:* ${nombreClienteFinal} (+${numeroLimpio})\n💬 *Mensaje:* "${messageText}"\n\n⚠️ *Atención requerida. El asistente automático se pausó durante 60 minutos.*`;
        await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, MI_WHATSAPP_PERSONAL, alertaAvisos);

        return NextResponse.json({ success: true, mode: 'mayorista_vendedor_pausa' });
      }

      // MENÚ PRINCIPAL MAYORISTA (RESTRUCTURADO)
      const menuMayorista = `🏛️ *PANEL DE CONTROL MAYORISTA — ELECTRO·NIC*\n\nEstimado/a *${nombreClienteFinal}*, seleccione la opción deseada:\n\n1️⃣ **Stock Usados Selección** (% Baterías)\n2️⃣ **Stock Nuevos Sellados** (Garantía Oficial)\n3️⃣ **Lotes en Tránsito** (Precios de Reserva)\n4️⃣ **Atención Comercial Directa** / *Comprar* 🛍️\n\n──────────────────────────\n_Responda únicamente con el número de la opción (1, 2, 3 o 4)._`;
      await enviarRespuestaWA(evolutionUrl!, evolutionApiKey!, INSTANCE_NAME, remoteJid, menuMayorista);
      return NextResponse.json({ success: true, mode: 'mayorista_menu' });
    }

    // -------------------------------------------------------------
    // 7) ATENCIÓN A CLIENTES MINORISTAS (GROQ IA)
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

      if (detalleCita) {
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

// 🚀 GUARDADO DE CLIENTES
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