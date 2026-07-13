import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { cuit } = await req.json()
    
    if (!cuit || cuit.length !== 11) {
      return NextResponse.json({ success: false, error: "El CUIT debe tener exactamente 11 dígitos numéricos." }, { status: 400 })
    }

    const res = await fetch(`https://afip.tangofactura.com/Rest/GetContribuyente?cuit=${cuit}`, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!res.ok) {
      return NextResponse.json({ success: false, error: "El servidor de padrón está temporalmente caído." })
    }

    const data = await res.json()

    if (data.errorFaltante) {
      return NextResponse.json({ success: false, error: "El CUIT no pertenece a un contribuyente inscripto." })
    }

    // 🚀 LA RED DE ARRASTRE: Buscamos el nombre en TODAS las combinaciones y mayúsculas/minúsculas posibles
    const razonSocial = data?.Contribuyente?.nombre 
                     || data?.Contribuyente?.Nombre 
                     || data?.Contribuyente?.razonSocial 
                     || data?.Contribuyente?.RazonSocial 
                     || data?.nombre 
                     || data?.Nombre 
                     || data?.razonSocial 
                     || data?.RazonSocial;

    // 🚀 EL CHISMOSO: Si por alguna locura cósmica sigue fallando, te imprime la respuesta real en pantalla
    if (!razonSocial) {
      return NextResponse.json({ 
        success: false, 
        error: `FORMATO DESCONOCIDO. AFIP Mandó esto: ${JSON.stringify(data).substring(0, 150)}` 
      })
    }

    return NextResponse.json({
      success: true,
      nombre: razonSocial
    })

  } catch (error: any) {
    console.error("Error en Padrón Público:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Error al conectarse a la base de datos de contribuyentes." 
    }, { status: 500 })
  }
}