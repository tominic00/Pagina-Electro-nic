import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { cuit } = await req.json()
    
    if (!cuit || cuit.length !== 11) {
      return NextResponse.json({ success: false, error: "El CUIT debe tener exactamente 11 dígitos numéricos." }, { status: 400 })
    }

    // 🚀 BYPASS DEFINITIVO: Como AfipSDK cobra por usar el Padrón, los esquivamos.
    // Usamos el proxy público, gratuito y ultra rápido de TangoFactura para resolver el CUIT.
    const res = await fetch(`https://afip.tangofactura.com/Rest/GetContribuyente?cuit=${cuit}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })

    if (!res.ok) {
      return NextResponse.json({ success: false, error: "El servidor público de padrón está temporalmente fuera de línea." })
    }

    const data = await res.json()

    // Si el CUIT no existe o está dado de baja, Tango devuelve "error: true"
    if (data.error || !data.Contribuyente) {
      return NextResponse.json({ success: false, error: data.mensaje || "El CUIT no pertenece a un contribuyente activo." })
    }

    // Extraemos la Razón Social limpia
    const razonSocial = data.Contribuyente.nombre || data.Contribuyente.razonSocial

    return NextResponse.json({
      success: true,
      nombre: razonSocial
    })

  } catch (error: any) {
    console.error("Error en Padrón Público:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Error inesperado al resolver el CUIT en la base de datos." 
    }, { status: 500 })
  }
}