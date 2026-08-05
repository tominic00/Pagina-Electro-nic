import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const evolutionUrl = process.env.EVOLUTION_API_URL;
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  const INSTANCE_NAME = 'electro-nic-cel-bot';

  // Buscar citas confirmadas en las próximas 2 horas que no se haya enviado recordatorio
  const ahora = new Date();
  const proximaVentana = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);

  const { data: citasAviso } = await supabase
    .from('citas')
    .select('*')
    .eq('estado', 'confirmada')
    .eq('recordatorio_enviado', false)
    .gte('fecha_hora', ahora.toISOString())
    .lte('fecha_hora', proximaVentana.toISOString());

  for (const cita of citasAviso || []) {
    const mensajeRecordatorio = `⏰ *RECORDATORIO:* ¡Hola ${cita.cliente_nombre}! Te recordamos tu cita hoy en Electro·Nic para ver el ${cita.equipo} en Florida Sur 24 local 2, Yerba Buena. ¡Te esperamos!`;

    if (evolutionUrl && evolutionApiKey) {
      await fetch(`${evolutionUrl}/message/sendText/${INSTANCE_NAME}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': evolutionApiKey },
        body: JSON.stringify({ number: cita.cliente_telefono, text: mensajeRecordatorio })
      });

      await supabase.from('citas').update({ recordatorio_enviado: true }).eq('id', cita.id);
    }
  }

  return NextResponse.json({ recordatorios_enviados: citasAviso?.length || 0 });
}