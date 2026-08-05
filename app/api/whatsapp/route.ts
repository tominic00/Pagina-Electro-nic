import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

// Reemplazá con tu número REAL (ejemplo: 5493815123456@s.whatsapp.net)
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

    // Guardar mensaje entrante
    await supabase.from('mensajes_whatsapp').insert({
      remote_jid: remoteJid,
      role: 'user',
      content: messageText
    });

    // Cargar historial previo (últimos 6)
    const { data: historialPrevio } = await supabase
      .from('mensajes_whatsapp')
      .select('role, content')
      .eq('remote_jid', remoteJid)
      .order('id', { ascending: false })
      .limit(6);

    const mensajesOrdenados = (historialPrevio || []).reverse();

    // Cargar stock
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

    // Guardar respuesta de la IA
    await supabase.from('mensajes_whatsapp').insert({
      remote_jid: remoteJid,
      role: 'ia',
      content: aiReply
    });

    // DETECTAR CITA
    const matchCita = aiReply.match(/\[AGENDAR_CITA:\s*(.*?)\]/i);
    let detalleCita = '';

    if (matchCita) {
      detalleCita = matchCita[1];
      console.log('✅ CITA DETECTADA:', detalleCita);
      // Ocultar la etiqueta para el cliente
      aiReply = aiReply.replace(/\[AGENDAR_CITA:\s*.*?\]/i, '').trim();
    } else {
      console.log('⚠️ No se detectó etiqueta [AGENDAR_CITA] en el mensaje de la IA');
    }

    // Responder al cliente
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

      // Notificar a tu celular personal
      if (detalleCita && !MI_WHATSAPP_PERSONAL.includes('XXXXXXX')) {
        const numeroCliente = remoteJid.replace('@s.whatsapp.net', '');
        const mensajeAviso = `🚨 *¡NUEVA CITA REGISTRADA!* 🚨\n\n👤 *Cliente:* ${pushName} (+${numeroCliente})\n📝 *Detalle:* ${detalleCita}\n\n⚠️ _Por favor confirmale la cita al cliente._`;

        console.log(`Enviando aviso a tu número personal (${MI_WHATSAPP_PERSONAL})...`);

        const resAviso = await fetch(`${evolutionUrl}/message/sendText/${INSTANCE_NAME}`, {
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

        console.log('Respuesta envío aviso personal:', await resAviso.text());
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error en WhatsApp:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}