import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionApiKey = process.env.EVOLUTION_API_KEY;
    const INSTANCE_NAME = 'electro-nic-cel-bot';

    if (!supabaseUrl || !supabaseKey || !evolutionUrl || !evolutionApiKey) {
      return NextResponse.json({ error: 'Faltan variables de entorno' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Obtener todos los clientes mayoristas
    const { data: mayoristas } = await supabase.from('clientes_mayorista').select('*');
    // 2. Obtener el stock físico actualizado
    const { data: stock } = await supabase.from('stock_mayorista').select('*').eq('estado', 'Disponible');

    if (!mayoristas || mayoristas.length === 0) {
      return NextResponse.json({ message: 'No hay clientes mayoristas registrados.' });
    }

    // Armar resumen rápido del stock
    let resumenStock = "📱 *DESTACADOS DE HOY:*\n";
    stock?.slice(0, 8).forEach(item => {
      const bat = item.bateria ? `(Bat: ${item.bateria}%)` : '(Nuevo)';
      resumenStock += `• ${item.equipo} ${bat} ➖ *U$D ${item.precio_venta_usd}*\n`;
    });

    const mensajeDifusion = `¡Buenas buenas! ☀️☕ Arrancamos la mañana en Electro·Nic con las naves listas para salir a rodar. 🚀\n\nTe dejo los destacados de hoy para que cargues tu local antes de que vuelen:\n\n${resumenStock}\n\n¿Querés reservar o ver la lista completa? Respóndeme con un número:\n\n1️⃣ Usados Impecables (% Bat)\n2️⃣ Nuevos Sellados\n3️⃣ Equipos en Camino\n4️⃣ Comprar o Hablar con Vendedor 🛒`;

    // Enviar mensaje a cada mayorista
    let envios = 0;
    for (const m of mayoristas) {
      const num = m.telefono || m.remote_jid;
      if (num) {
        await fetch(`${evolutionUrl}/message/sendText/${INSTANCE_NAME}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'apikey': evolutionApiKey },
          body: JSON.stringify({ number: num, text: mensajeDifusion })
        });
        envios++;
      }
    }

    return NextResponse.json({ success: true, mensajesEnviados: envios });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}