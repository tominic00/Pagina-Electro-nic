import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: Request) {
  try {
    const { cuit } = await req.json()
    
    if (!cuit || cuit.length !== 11) {
      return NextResponse.json({ success: false, error: "El CUIT debe tener exactamente 11 dígitos numéricos." }, { status: 400 })
    }

    // 1. Lectura de tus certificados oficiales
    const rootCertsDir = path.join(process.cwd(), "afip_certs")
    const keyPath = path.join(rootCertsDir, "privada.key")
    const certPath = path.join(rootCertsDir, "certificado.crt")

    const certContenido = fs.readFileSync(certPath, "utf-8")
    const keyContenido = fs.readFileSync(keyPath, "utf-8")

    const Afip = require("@afipsdk/afip.js")
    
    // 🚀 EL FIX MAESTRO: Borramos el access_token. 
    // Al no tenerlo, la librería ignora el proxy pago y pega directo en los servidores de AFIP
    const afip = new Afip({
      CUIT: 27232392628,
      cert: certContenido,
      key: keyContenido,
      production: true,
      ta_folder: "/tmp",
      res_folder: "/tmp"
    })

    const datosAfip = await afip.RegisterScopeFive.getTaxpayerDetails(Number(cuit))

    if (!datosAfip) {
      return NextResponse.json({ success: false, error: "No se encontraron datos oficiales para este CUIT." })
    }

    const persona = datosAfip.personaReturn?.persona || datosAfip.persona || datosAfip
    
    if (!persona) {
      return NextResponse.json({ success: false, error: "El CUIT no pertenece a una persona activa." })
    }

    const razonSocial = persona.razonSocial || `${persona.apellido || ""} ${persona.nombre || ""}`.trim()

    return NextResponse.json({
      success: true,
      nombre: razonSocial
    })

  } catch (error: any) {
    console.error("Error en Padrón AFIP:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Error al conectar directo con AFIP." 
    }, { status: 500 })
  }
}