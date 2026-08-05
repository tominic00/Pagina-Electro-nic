import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

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

    if (!messageText || !remoteJid) {
      return NextResponse.json({ status: 'no_message_data' });
    }

    // 3. Verificación de seguridad de Variables de Entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;

    if (!supabaseUrl || !supabaseKey || !groqKey) {
      console.error('Faltan variables de entorno clave (Supabase o Groq)');
      return NextResponse.json({ error: 'Faltan variables de entorno' }, { status: 500 });
    }

    // Inicializamos clientes adentro del handler
    const supabase = createClient(supabaseUrl, supabaseKey);
    const groq = new Groq({ apiKey: groqKey });

    // 4. Consultar Supabase
    const { data: productos } = await supabase.from('productos').select('*');

    // 5. Consultar a Groq
    const systemPrompt = `Sos el asistente virtual de ventas MAYORISTAS de Electro-Nic. 
Tu objetivo es responder dudas de clientes y vender productos basándote en esta lista:
${JSON.stringify(productos || [], null, 2)}

Reglas:
- Respuestas breves y claras para WhatsApp.
- Mencioná precios mayoristas y condiciones si preguntan.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: messageText }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const aiReply = chatCompletion.choices[0]?.message?.content || "Hola, en breve te atendemos.";

    // 6. Responder a WhatsApp vía Evolution API
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
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('ERROR DETALLADO EN WHATSAPP:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}