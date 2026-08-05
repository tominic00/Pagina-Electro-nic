import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.data?.key?.fromMe) {
      return NextResponse.json({ status: 'ignored' });
    }

    const messageText = body.data?.message?.conversation || 
                        body.data?.message?.extendedTextMessage?.text;
    const remoteJid = body.data?.key?.remoteJid;

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

    // 1. Obtener la configuración dinámica de la IA guardada desde la solapa del panel
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

    // 2. Traer stock de la carpeta mayorista
    const { data: stockActual } = await supabase
      .from('stock_mayorista')
      .select('*')
      .eq('estado', 'Disponible');

    const stockFormateado = (stockActual || []).map(eq => 
      `- ${eq.equipo} | Condición: ${eq.condicion} | Bat: ${eq.bateria || 'N/A'}% | Precio Minorista: USD ${eq.precio_minorista_usd || eq.precio_venta_usd}`
    ).join("\n");

    // 3. Prompt dinámico (configurado en el panel) con reemplazo de {STOCK_DATA}
    const promptBase = config?.system_prompt || `Sos el vendedor de Electro·Nic. INVENTARIO:\n{STOCK_DATA}`;
    const systemPromptFinal = promptBase.replace("{STOCK_DATA}", stockFormateado || "Actualmente no hay stock disponible.");

    // 4. Generar respuesta
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPromptFinal },
        { role: 'user', content: messageText }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const aiReply = chatCompletion.choices[0]?.message?.content || "Hola! En un momento te atendemos.";

    // 5. Responder a WhatsApp
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
    console.error('Error en WhatsApp Mayorista:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}