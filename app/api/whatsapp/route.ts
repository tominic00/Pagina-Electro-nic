import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const MI_WHATSAPP_PERSONAL = '5493815944101@s.whatsapp.net';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.data?.key?.fromMe) {
      return NextResponse.json({ status: 'ignored' });
    }

    const messageText = body.data?.message?.conversation || 
                        body.data?.message?.extendedTextMessage?.text;
    const remoteJid = body.data?.key?.remoteJid;
    const pushName = body.data?.pushName || 'Cliente';

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
    const INSTANCE_NAME = 'electro-nic-cel-bot';

    // -------------------------------------------------------------
    // A) SI EL MENSAJE ES TUYO (EL DUEÑO RESPONDIENDO UNA CITA)
    // -------------------------------------------------------------
    if (remoteJid === MI_WHATSAPP_PERSONAL) {
      // Buscar la última cita pendiente registrada
      const { data: ultimaCita } = await supabase
        .from('citas')
        .select('*')
        .eq('estado', 'pendiente')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (ultimaCita) {
        // Pedir a Groq que entienda la decisión del dueño
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
          // Actualizar estado en Supabase
          await supabase.from('citas').update({ estado: 'confirmada' }).eq('id', ultimaCita.id);

          // Avisar al cliente
          const mensajeCliente = `¡Hola ${ultimaCita.cliente_nombre}! 👋 Te confirmo que quedó agendada la cita para ver el ${ultimaCita.equipo}. Te esperamos en el local (Florida Sur 24 local 2, Yerba Buena). ¡Nos vemos!`;
          
          await fetch(`${evolutionUrl}/message/sendText/${INSTANCE_NAME}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': evolutionApiKey! },
            body: JSON.stringify({ number: ultimaCita.cliente_telefono, text: mensajeCliente })
          });

          // Confirmarte a vos
          await fetch(`${evolutionUrl}/message/sendText/${INSTANCE_NAME}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': evolutionApiKey! },
            body: JSON.stringify({ number: MI_WHATSAPP_PERSONAL, text: `✅ Cita de ${ultimaCita.cliente_nombre} confirmada y avisada al cliente.` })
          });

        } else {
          // Actualizar estado y enviar respuesta personalizada de reprogramación
          await supabase.from('citas').update({ estado: 'reprogramada' }).eq('id', ultimaCita.id);

          await fetch(`${evolutionUrl}/message/sendText/${INSTANCE_NAME}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': evolutionApiKey! },
            body: JSON.stringify({ number: ultimaCita.cliente_telefono, text: decision })
          });

          await fetch(`${evolutionUrl}/message/sendText/${INSTANCE_NAME}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': evolutionApiKey! },
            body: JSON.stringify({ number: MI_WHATSAPP_PERSONAL, text: `📩 Mensaje de cambio de horario enviado a ${ultimaCita.cliente_nombre}.` })
          });
        }

        return NextResponse.json({ success: true, mode: 'owner_intervention' });
      }
    }

    // -------------------------------------------------------------
    // B) FLUJO NORMAL DE ATENCIÓN AL CLIENTE
    // -------------------------------------------------------------
    const { data: config } = await supabase
      .from('configuracion_ia')
      .select('*')
      .eq('id', 1)
      .single();

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

    const { data: stockActual } = await supabase
      .from('stock_mayorista')
      .select('*')
      .eq('estado', 'Disponible');

    const stockFormateado = (stockActual || []).map(eq => 
      `- ${eq.equipo} | Condición: ${eq.condicion} | Bat: ${eq.bateria || 'N/A'}% | Precio Minorista: USD ${eq.precio_minorista_usd || eq.precio_venta_usd}`
    ).join("\n");

    const promptBase = config?.system_prompt || `Sos el vendedor de Electro·Nic. INVENTARIO:\n{STOCK_DATA}`;
    const systemPromptFinal = promptBase.replace("{STOCK_DATA}", stockFormateado || "Sin stock disponible.");

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

    let aiReply = chatCompletion.choices[0]?.message?.content || "Hola, en un momento te atendemos.";

    await supabase.from('mensajes_whatsapp').insert({
      remote_jid: remoteJid,
      role: 'ia',
      content: aiReply
    });

    // Detectar si la IA sugirió agendar una cita
    const matchCita = aiReply.match(/\[AGENDAR_CITA:\s*(.*?)\]/i);
    let detalleCita = '';

    if (matchCita) {
      detalleCita = matchCita[1];
      aiReply = aiReply.replace(/\[AGENDAR_CITA:\s*.*?\]/i, '').trim();

      // Guardar cita pendiente en Supabase
      await supabase.from('citas').insert({
        cliente_nombre: pushName,
        cliente_telefono: remoteJid,
        equipo: detalleCita,
        fecha_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Ajustable según parseo de fecha
        estado: 'pendiente'
      });
    }

    // Enviar respuesta al cliente
    if (evolutionUrl && evolutionApiKey) {
      await fetch(`${evolutionUrl}/message/sendText/${INSTANCE_NAME}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': evolutionApiKey },
        body: JSON.stringify({ number: remoteJid, text: aiReply })
      });

      // Notificar a tu WhatsApp si hay cita
      if (detalleCita && MI_WHATSAPP_PERSONAL !== remoteJid) {
        const numeroCliente = remoteJid.replace('@s.whatsapp.net', '');
        const mensajeAviso = `🚨 *¡NUEVA CITA PENDIENTE DE APROBACIÓN!* 🚨\n\n👤 *Cliente:* ${pushName} (+${numeroCliente})\n📝 *Detalle:* ${detalleCita}\n\n👉 *Responde a este mensaje decidiendo:* \n- "Confirmado" (para avisarle que sí)\n- o escribí la razón / nuevo horario si tenés que cambiarlo.`;

        await fetch(`${evolutionUrl}/message/sendText/${INSTANCE_NAME}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': evolutionApiKey },
          body: JSON.stringify({ number: MI_WHATSAPP_PERSONAL, text: mensajeAviso })
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error en WhatsApp:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}