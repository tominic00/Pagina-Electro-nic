import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: Request) {
  try {
    const { cuit } = await req.json()
    
    if (!cuit || cuit.length !== 11) {
      return NextResponse.json({ success: false, error: "El CUIT debe tener exactamente 11 dígitos numéricos." }, { status: 400 })
    }

    // 1. Lectura de tus llaves comerciales
    const rootCertsDir = path.join(process.cwd(), "afip_certs")
    const keyPath = path.join(rootCertsDir, "privada.key")
    const certPath = path.join(rootCertsDir, "certificado.crt")

    const certContenido = fs.readFileSync(certPath, "utf-8")
    const keyContenido = fs.readFileSync(keyPath, "utf-8")

    // 2. 🚀 EL FIX: Usamos require para evitar que Vercel rompa el constructor al minificar
    const Afip = require("@afipsdk/afipsdk")
    
    const afip = new Afip({
      CUIT: 27232392628,
      cert: certContenido,
      key: keyContenido,
      production: true,
      access_token: "t2q0yDV8TBzUPXHthmUr3tPexR79X13ro71ZjVZkrIpRaXlWLVoiU1CdMxZReA6jX", // 👈 ⚠️ ¡PEGÁ TU TOKEN REAL ACÁ!
      ta_folder: "/tmp",
      res_folder: "/tmp"
    })

    // 3. Consulta al padrón ws_sr_padron_a5
    const datosAfip = await afip.Register.getTaxpayerDetails(Number(cuit))

    if (!datosAfip || !datosAfip.personaReturn) {
      return NextResponse.json({ success: false, error: "No se encontraron datos oficiales para este CUIT." })
    }

    const persona = datosAfip.personaReturn.persona
    const razonSocial = persona.razonSocial || `${persona.apellido || ""} ${persona.nombre || ""}`.trim()

    return NextResponse.json({
      success: true,
      nombre: razonSocial
    })

  } catch (error: any) {
    console.error("Error en Padrón AFIP:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Error inesperado en la conexión con el padrón." 
    }, { status: 500 })
  }
}