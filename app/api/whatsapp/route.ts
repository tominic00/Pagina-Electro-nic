import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Ignorar mensajes del propio bot
    if (body.data?.key?.fromMe) {
      return NextResponse.json({ status: 'ignored' });
    }

    // 2. Extraer texto y número
    const messageText = body.data?.message?.conversation || 
                        body.data?.message?.extendedTextMessage?.text;
    const remoteJid = body.data?.key?.remoteJid;

    if (!messageText || !remoteJid) {
      return NextResponse.json({ status: 'no_message_data' });
    }

    // 3. Variables de Entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;

    if (!supabaseUrl || !supabaseKey || !groqKey) {
      return NextResponse.json({ error: 'Faltan variables de entorno' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const groq = new Groq({ apiKey: groqKey });

    // 4. Traer el stock disponible de 'stock_mayorista'
    const { data: stockActual } = await supabase
      .from('stock_mayorista')
      .select('*')
      .eq('estado', 'Disponible');

    // 5. Formatear el stock exacto como en el simulador
    const stockFormateado = (stockActual || []).map(eq => 
      `- ${eq.equipo} | Condición: ${eq.condicion} | Bat: ${eq.bateria || 'N/A'}% | Precio Minorista: USD ${eq.precio_minorista_usd || eq.precio_venta_usd}`
    ).join("\n");

    // 6. Definir el prompt idéntico al de tu simulador
    const systemPrompt = `Sos el vendedor estrella de Electro·Nic, un local de celulares en Tucumán. Estás atendiendo a un cliente por WhatsApp.

REGLAS ESTRICTAS:
1. Respuestas súper cortas y al pie (máximo 2 oraciones por mensaje).
2. Hablá en argentino informal y amigable (usá 'vos', 'mirá', 'fijate', 'te comento').
3. NUNCA uses listas con viñetas, emojis exagerados ni negritas excesivas. Escribí como una persona real en WhatsApp.
4. Si preguntan por un equipo que NO está en el stock, decile: "Uh, de ese justo me quedé sin nada, pero te puedo ofrecer..." y ofrecele algo similar.
5. Si preguntan precio, pasale SIEMPRE el "Precio Minorista" en USD. Aclará que aceptan USDT, Dólares físicos y Pesos al cambio del día.
6. NUNCA inventes precios ni stock. Usá SOLO la información del inventario que te paso abajo.

INVENTARIO ACTUAL EN TIEMPO REAL:
${stockFormateado || "Actualmente no hay stock disponible."}`;

    // 7. Petición a Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: messageText }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const aiReply = chatCompletion.choices[0]?.message?.content || "Hola! En un momento te atendemos.";

    // 8. Enviar respuesta por WhatsApp
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
    console.error('Error en WhatsApp:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}