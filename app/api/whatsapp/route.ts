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

    // 3. Verificación de variables
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

    // 4. Traer SOLO los productos/precios mayoristas
    // (Si tenés una columna 'es_mayorista', o tabla 'productos_mayoristas', ajustalo acá)
    const { data: productosMayoristas } = await supabase
      .from('productos')
      .select('*'); 

    // 5. System Prompt enfocado 100% en la venta MAYORISTA
    const systemPrompt = `Sos el asesor exclusivo de ventas MAYORISTAS de Electro-Nic.
Atendés a revendedores, comerciantes y clientes mayoristas por WhatsApp.

Catálogo y precios mayoristas disponibles:
${JSON.stringify(productosMayoristas || [], null, 2)}

REGLAS DE ATENCIÓN MAYORISTA:
1. Tu enfoque principal es la venta POR MAYOR (mencioná cantidades mínimas, packs o precios mayoristas si aplican).
2. Mantené un tono profesional, ágil y comerciante.
3. Respuestas concisas, listas para leer en WhatsApp (usá viñetas o negritas para precios/productos).
4. Si preguntan por condiciones de compra mayorista, explicá los medios de pago, envíos y montos mínimos de compra de la tienda.`;

    // 6. Generar respuesta con Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: messageText }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const aiReply = chatCompletion.choices[0]?.message?.content || "Hola! En un momento te asesoramos con tu pedido mayorista.";

    // 7. Enviar a WhatsApp
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
    console.error('ERROR EN WHATSAPP MAYORISTA:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}