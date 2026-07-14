import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: Request) {
  try {
    const { cuit } = await req.json()
    
    if (!cuit || cuit.length !== 11) {
      return NextResponse.json({ success: false, error: "El CUIT debe tener exactamente 11 dígitos numéricos." }, { status: 400 })
    }

    const rootCertsDir = path.join(process.cwd(), "afip_certs")
    const keyPath = path.join(rootCertsDir, "privada.key")
    const certPath = path.join(rootCertsDir, "certificado.crt")

    const certContenido = fs.readFileSync(certPath, "utf-8")
    const keyContenido = fs.readFileSync(keyPath, "utf-8")

    const Afip = require("@afipsdk/afip.js")
    
    const afip = new Afip({
      CUIT: 27232392628,
      cert: certContenido,
      key: keyContenido,
      production: true,
      ta_folder: "/tmp",
      res_folder: "/tmp"
    })

    // 🚀 EL FIX TRIUNFAL: Como AFIP te dio el Padrón A13, usamos la clase RegisterScopeThirteen
    const datosAfip = await afip.RegisterScopeThirteen.getTaxpayerDetails(Number(cuit))

    if (!datosAfip) {
      return NextResponse.json({ success: false, error: "No se encontraron datos en AFIP." })
    }

    const persona = datosAfip.personaReturn?.persona || datosAfip.persona || datosAfip
    if (!persona) return NextResponse.json({ success: false, error: "El CUIT no está activo." })

    const razonSocial = persona.razonSocial || `${persona.apellido || ""} ${persona.nombre || ""}`.trim()
    if (!razonSocial) return NextResponse.json({ success: false, error: "AFIP no devolvió un nombre." })

    return NextResponse.json({ success: true, nombre: razonSocial })

  } catch (error: any) {
    console.error("Error Oficial AFIP:", error.message || error)
    
    const esErrorPermisos = error.message?.includes('401') || error.response?.status === 401;
    
    return NextResponse.json({ 
      success: false, 
      error: esErrorPermisos 
        ? "⚠️ Falta delegar el servicio 'Consulta Padrón A13' en AFIP. (Tarda unos 30 min en impactar)" 
        : "AFIP rechazó la conexión. Intentá de nuevo." 
    }, { status: 500 })
  }
}