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

    // 🚀 2. SOLUCIÓN UNIVERSAL: Pedimos el Ticket de Acceso (TA) para el padrón A5
    const ta = await afip.GetServiceTA('ws_sr_padron_a5')
    
    // 🚀 3. Ejecutamos la consulta directa al método oficial de AFIP
    const datosAfip = await afip.WebService('ws_sr_padron_a5').execute('getPersona', {
      token: ta.token,
      sign: ta.sign,
      cuitRepresentada: 27232392628, // Tu CUIT emisor
      idPersona: Number(cuit)        // El CUIT del cliente que consultás
    })

    if (!datosAfip || !datosAfip.personaReturn) {
      return NextResponse.json({ success: false, error: "No se encontraron datos oficiales para este CUIT en AFIP." })
    }

    const persona = datosAfip.personaReturn.persona
    
    if (!persona) {
      return NextResponse.json({ success: false, error: "El CUIT no pertenece a una persona activa en el padrón." })
    }

    // Extraemos la Razón Social o armamos el nombre completo si es persona física
    const razonSocial = persona.razonSocial || `${persona.apellido || ""} ${persona.nombre || ""}`.trim()

    return NextResponse.json({
      success: true,
      nombre: razonSocial
    })

  } catch (error: any) {
    console.error("Error en Padrón AFIP:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Error inesperado en la conexión con el padrón de AFIP." 
    }, { status: 500 })
  }
}