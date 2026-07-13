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

    // 🚀 LA SOLUCIÓN INICIAL CORREGIDA: En la librería de JS, el método es plano y directo.
    // No lleva ".Register", se ejecuta directo sobre "afip"
    const datosAfip = await afip.getTaxpayerDetails(Number(cuit))

    if (!datosAfip) {
      return NextResponse.json({ success: false, error: "No se encontraron datos oficiales para este CUIT en el padrón." })
    }

    // Estructura de respuesta blindada (dependiendo de cómo responda el proxy de la librería)
    const persona = datosAfip.personaReturn?.persona || datosAfip.persona || datosAfip
    
    if (!persona) {
      return NextResponse.json({ success: false, error: "El CUIT fue rechazado o no se encuentra activo." })
    }

    // Extraemos la Razón Social o el nombre completo de la persona física
    const razonSocial = persona.razonSocial || `${persona.apellido || ""} ${persona.nombre || ""}`.trim()

    if (!razonSocial) {
      return NextResponse.json({ success: false, error: "El CUIT no devolvió una Razón Social válida." })
    }

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