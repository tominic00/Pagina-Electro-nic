import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 🚀 CAMBIO 1: Ahora también recibimos 'metodoPago' desde el frontend
    const { carrito, cliente, dolarBlue, metodoPago } = body;

    // 🛑 IMPORTANTE: Recordá dejar acá tu clave real de Mercado Pago (Access Token)
    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || "APP_USR-3408227527468681-062517-d3c50893d59b25faf9981a48c1d7da88-99469222";
    
    // 1. Preparamos los ítems para Mercado Pago convirtiendo los dólares a pesos
    const itemsMP = carrito.map((item: any) => {
      let precioUnitarioUSD = item.precio;
      if (item.cantidadComprada >= 50) precioUnitarioUSD = item.precio * 0.75;
      else if (item.cantidadComprada >= 10) precioUnitarioUSD = item.precio * 0.85;

      const precioUnitarioPesos = Math.round(precioUnitarioUSD * dolarBlue);

      return {
        id: item.id,
        title: item.nombre,
        quantity: item.cantidadComprada,
        currency_id: "ARS",
        unit_price: precioUnitarioPesos
      };
    });

    // 2. Armamos la orden oficial con tu dominio de Vercel
    const preferenceData = {
      items: itemsMP,
      payer: {
        name: cliente.nombre,
        email: "cliente@tudominio.com", 
      },
      back_urls: {
        success: "https://pepti-age.vercel.app/portal/dashboard?pago=exito",
        failure: "https://pepti-age.vercel.app/portal/dashboard?pago=error",
        pending: "https://pepti-age.vercel.app/portal/dashboard?pago=pendiente"
      },
      auto_return: "approved",
    };

    // 🛡️ CAMBIO 2: Evaluamos si el cliente viene desde el botón de QR
    const esPagoConQR = metodoPago === 'qr';

    let preferenceFinal = { ...preferenceData };

    // Si el cliente eligió QR, le aplicamos el candado anti-tarjetas
    if (esPagoConQR) {
      preferenceFinal = {
        ...preferenceData,
        payment_methods: {
          excluded_payment_types: [
            { id: "credit_card" }, // Bloquea tarjetas de crédito
            { id: "debit_card" }   // Bloquea tarjetas de débito
          ],
          installments: 1
        },
        purpose: "wallet_purchase" 
      } as any;
    }

    // 3. Hablamos con los servidores de Mercado Pago
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      // 🔄 CAMBIO 3: Enviamos la preferencia procesada (filtrada si es QR, normal si es Tarjeta)
      body: JSON.stringify(preferenceFinal), 
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al generar link de Mercado Pago");
    }

    // 4. Devolvemos el link de pago oficial a la pantalla del cliente
    return NextResponse.json({ url: data.init_point }); 

  } catch (error: any) {
    console.error("Error MP:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}