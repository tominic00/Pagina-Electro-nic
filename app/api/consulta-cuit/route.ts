import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: Request) {
  try {
    const { cuit } = await req.json()
    
    if (!cuit || cuit.length !== 11) {
      return NextResponse.json({ success: false, error: "El CUIT debe tener exactamente 11 dígitos numéricos." }, { status: 400 })
    }

    // 1. Lectura de tus certificados comerciales
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

    // 🚀 EL FIX: No pases ni token ni sign. El SDK los genera e inyecta de forma automática en el fondo.
    const datosAfip = await afip.WebService('ws_sr_padron_a5').execute('getPersona', {
      cuitRepresentada: 27232392628, // Tu CUIT emisor
      idPersona: Number(cuit)        // El CUIT del cliente que estás buscando
    })

    if (!datosAfip || !datosAfip.personaReturn) {
      return NextResponse.json({ success: false, error: "No se encontraron datos oficiales para este CUIT en el padrón." })
    }

    const persona = datosAfip.personaReturn.persona
    
    if (!persona) {
      return NextResponse.json({ success: false, error: "El CUIT no pertenece a una persona o empresa activa." })
    }

    // Extraemos la Razón Social limpia (o Nombre y Apellido si es monotributista/persona física)
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