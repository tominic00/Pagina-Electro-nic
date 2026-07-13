import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: Request) {
  try {
    const { cuit } = await req.json()
    
    if (!cuit || cuit.length !== 11) {
      return NextResponse.json({ success: false, error: "El CUIT debe tener exactamente 11 dígitos numéricos." }, { status: 400 })
    }

    // 1. Lectura de tus certificados
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
      access_token: "2q0yDV8TBzUPXHthmUr3tPexR79X13ro71ZjVZkrIpRaXlWLVoiU1CdMxZReA6jX", // 👈 Tu token real
      ta_folder: "/tmp",
      res_folder: "/tmp"
    })

    // 🚀 AHORA SÍ: El nombre exacto de la clase para el Padrón A5 en afip.js
    const datosAfip = await afip.RegisterScopeFive.getTaxpayerDetails(Number(cuit))

    if (!datosAfip) {
      return NextResponse.json({ success: false, error: "No se encontraron datos oficiales para este CUIT." })
    }

    // El SDK de JS suele devolver la estructura cruda, nos atajamos de las posibles formas:
    const persona = datosAfip.personaReturn?.persona || datosAfip.persona || datosAfip
    
    if (!persona) {
      return NextResponse.json({ success: false, error: "El CUIT no pertenece a una persona activa." })
    }

    // Extraemos la Razón Social o el Nombre/Apellido
    const razonSocial = persona.razonSocial || `${persona.apellido || ""} ${persona.nombre || ""}`.trim()

    if (!razonSocial) {
      return NextResponse.json({ success: false, error: "AFIP no devolvió una Razón Social válida." })
    }

    return NextResponse.json({
      success: true,
      nombre: razonSocial
    })

  } catch (error: any) {
    console.error("Error en Padrón AFIP:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Error al conectar con AFIP." 
    }, { status: 500 })
  }
}