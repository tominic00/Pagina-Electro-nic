import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { cuit } = await req.json()
    
    if (!cuit || cuit.length !== 11) {
      return NextResponse.json({ success: false, error: "El CUIT debe tener exactamente 11 dígitos numéricos." }, { status: 400 })
    }

    // 🚀 BYPASS DEFINITIVO: Consulta al proxy de TangoFactura
    const res = await fetch(`https://afip.tangofactura.com/Rest/GetContribuyente?cuit=${cuit}`, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0' // Por si nos bloquean por ser bot
      }
    })

    if (!res.ok) {
      return NextResponse.json({ success: false, error: "El servidor público de padrón está temporalmente fuera de línea." })
    }

    const data = await res.json()

    // 🚀 EL FIX: TangoFactura devuelve "errorFaltante: true" si el CUIT no existe
    if (data.errorFaltante) {
      return NextResponse.json({ success: false, error: "El CUIT no pertenece a un contribuyente activo." })
    }

    // 🚀 EL FIX 2: Los datos vienen directo en la raíz (data.nombre), no adentro de otra cosa
    const razonSocial = data.nombre || data.razonSocial

    if (!razonSocial) {
      return NextResponse.json({ success: false, error: "AFIP no devolvió una Razón Social válida." })
    }

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