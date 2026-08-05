import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const MI_WHATSAPP_PERSONAL = '5493815944101@s.whatsapp.net'; // Tu número real

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Ignorar mensajes enviados por el propio bot
    if (body.data?.key?.fromMe) {
      return NextResponse.json({ status: 'ignored' });
    }

    // 2. Extraer el texto y el número del cliente
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

    // 3. Traer la configuración del System Prompt desde Supabase
    const { data: config } = await supabase
      .from('configuracion_ia')
      .select('*')
      .eq('id', 1)
      .single();

    const groqKeyToUse = config?.groq_api_key || fallbackGroqKey;
    if (!groqKeyToUse) {
      return NextResponse.json({ error: 'No se encontró la API Key de Groq' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: groqKeyToUse });

    // 4. Guardar el mensaje entrante del cliente en la base de datos
    await supabase.from('mensajes_whatsapp').insert({
      remote_jid: remoteJid,
      role: 'user',
      content: messageText
    });

    // 5. Cargar los últimos 6 mensajes de la conversación previa para darle MEMORIA
    const { data: historialPrevio } = await supabase
      .from('mensajes_whatsapp')
      .select('role, content')
      .eq('remote_jid', remoteJid)
      .order('id', { ascending: false })
      .limit(6);

    const mensajesOrdenados = (historialPrevio || []).reverse();

    // 6. Consultar el stock disponible
    const { data: stockActual } = await supabase
      .from('stock_mayorista')
      .select('*')
      .eq('estado', 'Disponible');

    const stockFormateado = (stockActual || []).map(eq => 
      `- ${eq.equipo} | Condición: ${eq.condicion} | Bat: ${eq.bateria || 'N/A'}% | Precio Minorista: USD ${eq.precio_minorista_usd || eq.precio_venta_usd}`
    ).join("\n");

    const promptBase = config?.system_prompt || `Sos el vendedor de Electro·Nic. INVENTARIO:\n{STOCK_DATA}`;
    const systemPromptFinal = promptBase.replace("{STOCK_DATA}", stockFormateado || "Sin stock disponible por el momento.");

    // 7. Armar la estructura del chat con el contexto completo
    const messagesForGroq = [
      { role: 'system', content: systemPromptFinal },
      ...mensajesOrdenados.map(m => ({
        role: m.role === 'ia' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    // 8. Generar respuesta con Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: messagesForGroq as any,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4, // Temperatura moderada para respuestas coherentes
    });

    let aiReply = chatCompletion.choices[0]?.message?.content || "Hola, en un momento te atendemos.";

    // 9. Guardar la respuesta de la IA en la base de datos
    await supabase.from('mensajes_whatsapp').insert({
      remote_jid: remoteJid,
      role: 'ia',
      content: aiReply
    });

    // 10. Detectar si agendó cita
    const matchCita = aiReply.match(/\[AGENDAR_CITA:\s*(.*?)\]/);
    let detalleCita = '';

    if (matchCita) {
      detalleCita = matchCita[1];
      aiReply = aiReply.replace(/\[AGENDAR_CITA:\s*.*?\]/, '').trim();
    }

    // 11. Enviar mensaje por WhatsApp vía Evolution API
    if (evolutionUrl && evolutionApiKey) {
      const INSTANCE_NAME = 'electro-nic-cel-bot';

      await fetch(`${evolutionUrl}/message/sendText/${INSTANCE_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey
        },
        body: JSON.stringify({
          number: remoteJid,
          text: aiReply
        })
      });

      // 12. Notificar a tu teléfono personal
      if (detalleCita && MI_WHATSAPP_PERSONAL !== '5493815944101@s.whatsapp.net') {
        const numeroCliente = remoteJid.replace('@s.whatsapp.net', '');
        const mensajeAviso = `🚨 *¡NUEVA CITA REGISTRADA!* 🚨\n\n👤 *Cliente:* ${pushName} (+${numeroCliente})\n📝 *Detalle:* ${detalleCita}\n\n⚠️ _Por favor confirmale la cita al cliente._`;

        await fetch(`${evolutionUrl}/message/sendText/${INSTANCE_NAME}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': evolutionApiKey
          },
          body: JSON.stringify({
            number: MI_WHATSAPP_PERSONAL,
            text: mensajeAviso
          })
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error en WhatsApp:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}