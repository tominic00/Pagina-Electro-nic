import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

// TU NÚMERO PERSONAL DE WHATSAPP (Ajustá con tu número real)
const MI_WHATSAPP_PERSONAL = '5493815944101@s.whatsapp.net'; // Ej: 5493811234567@s.whatsapp.net

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Ignorar mensajes del propio bot
    if (body.data?.key?.fromMe) {
      return NextResponse.json({ status: 'ignored' });
    }

    // 2. Extraer texto y número del cliente
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

    // 3. Traer configuración de la IA guardada en el panel mayorista
    const { data: config } = await supabase
      .from('configuracion_ia')
      .select('*')
      .eq('id', 1)
      .single();

    const groqKeyToUse = config?.groq_api_key || fallbackGroqKey;
    if (!groqKeyToUse) {
      return NextResponse.json({ error: 'No se encontró API Key de Groq' }, { status: 500 });
    }

    const groq = new Groq({ apiKey: groqKeyToUse });

    // 4. Traer stock mayorista disponible
    const { data: stockActual } = await supabase
      .from('stock_mayorista')
      .select('*')
      .eq('estado', 'Disponible');

    const stockFormateado = (stockActual || []).map(eq => 
      `- ${eq.equipo} | Condición: ${eq.condicion} | Bat: ${eq.bateria || 'N/A'}% | Precio Minorista: USD ${eq.precio_minorista_usd || eq.precio_venta_usd}`
    ).join("\n");

    // 5. System Prompt con instrucción especial para Citas
    const promptBase = config?.system_prompt || `Sos el vendedor de Electro·Nic. INVENTARIO:\n{STOCK_DATA}`;
    
    const reglaCitas = `\n\nREGLA ADICIONAL DE RESERVA DE CITAS:
- Si el cliente quiere ir a ver un equipo, concretar una compra o agendar una cita/visita al local, pedile su NOMBRE y el DÍA/HORA que prefiere pasar.
- Cuando el cliente te confirme el día y la hora, al final de tu respuesta agrega la marca exacta: [AGENDAR_CITA: Nombre - Equipo - Día y Hora].`;

    const systemPromptFinal = promptBase.replace("{STOCK_DATA}", stockFormateado || "Actualmente no hay stock disponible.") + reglaCitas;

    // 6. Generar respuesta con Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPromptFinal },
        { role: 'user', content: messageText }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    let aiReply = chatCompletion.choices[0]?.message?.content || "Hola! En un momento te atendemos.";

    // 7. Detectar si la IA agendó una cita
    const matchCita = aiReply.match(/\[AGENDAR_CITA:\s*(.*?)\]/);
    let detalleCita = '';

    if (matchCita) {
      detalleCita = matchCita[1];
      // Limpiamos la marca de la respuesta visible para el cliente
      aiReply = aiReply.replace(/\[AGENDAR_CITA:\s*.*?\]/, '').trim();
    }

    // 8. Responder al cliente por WhatsApp
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

      // 9. Si hay cita/reserva, enviarte una notificación a TU WhatsApp personal
      if (detalleCita && MI_WHATSAPP_PERSONAL !== '5493815944101@s.whatsapp.net') {
        const numeroCliente = remoteJid.replace('@s.whatsapp.net', '');
        const mensajeAviso = `🚨 *¡NUEVA CITA / INTENCIÓN DE COMPRA!* 🚨\n\n👤 *Cliente:* ${pushName} (+${numeroCliente})\n📝 *Detalle:* ${detalleCita}\n\n⚠️ _Por favor, ponete en contacto para confirmar el turno._`;

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
    console.error('Error en WhatsApp Mayorista:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}