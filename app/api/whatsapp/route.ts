import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

// Inicializamos Groq y Supabase
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Ignorar mensajes enviados por el propio bot para evitar bucles infinitos
    if (body.data?.key?.fromMe) {
      return NextResponse.json({ status: 'ignored' });
    }

    // 2. Extraer el texto del mensaje entrante y el número del cliente
    const messageText = body.data?.message?.conversation || 
                        body.data?.message?.extendedTextMessage?.text;
    const remoteJid = body.data?.key?.remoteJid; // ID/Número del cliente en WhatsApp

    if (!messageText || !remoteJid) {
      return NextResponse.json({ status: 'no_message_data' });
    }

    // 3. Consultar tu base de datos de Supabase (Productos mayoristas)
    const { data: productos } = await supabase.from('productos').select('*');

    // 4. Armar el Prompt para Groq (adaptado a tus ventas mayoristas)
    const systemPrompt = `Sos el asistente virtual de ventas MAYORISTAS de Electro-Nic. 
Tu objetivo es responder dudas de clientes y vender productos basándote en esta lista:
${JSON.stringify(productos, null, 2)}

Reglas:
- Respuestas breves y claras ideales para WhatsApp.
- Mencioná precios mayoristas y condiciones si preguntan.`;

    // 5. Consultar a la IA (Groq)
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: messageText }
      ],
      model: 'llama-3.3-70b-versatile', // O el modelo que usás en tu chat web
    });

    const aiReply = chatCompletion.choices[0]?.message?.content || "Hola, en breve te atendemos.";

    // 6. Enviar la respuesta de vuelta a WhatsApp usando la Evolution API
    const EVOLUTION_URL = process.env.EVOLUTION_API_URL; // Tu URL de Railway
    const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY; // Tu clave (ElectroNic12345)
    const INSTANCE_NAME = 'electro-nic-cel-bot';

    await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_KEY!
      },
      body: JSON.stringify({
        number: remoteJid,
        text: aiReply
      })
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error en Webhook WhatsApp:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}