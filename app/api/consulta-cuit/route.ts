import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

let Afip: any

try {
  const afipModule = require("@afipsdk/afipsdk")
  Afip = afipModule.default || afipModule
} catch (e) {
  console.warn("@afipsdk/afipsdk module not found")
}

export async function POST(req: Request) {
  try {
    const { cuit } = await req.json()
    
    if (!cuit || cuit.length !== 11) {
      return NextResponse.json({ success: false, error: "El CUIT debe tener exactamente 11 dígitos numéricos." }, { status: 400 })
    }

    // 1. Leemos tus certificados desde la raíz
    const rootCertsDir = path.join(process.cwd(), "afip_certs")
    const keyPath = path.join(rootCertsDir, "privada.key")
    const certPath = path.join(rootCertsDir, "certificado.crt")

    const certContenido = fs.readFileSync(certPath, "utf-8")
    const keyContenido = fs.readFileSync(keyPath, "utf-8")

    // 2. Inicializamos el SDK de AFIP
    const afip = new (Afip as any)({
      CUIT: 27232392628,
      cert: certContenido,
      key: keyContenido,
      production: true,
      access_token: "tu_token_real_de_afipsdk_aca_adentro", // 👈 Pegá tu token limpio acá
      ta_folder: "/tmp",
      res_folder: "/tmp"
    })

    // 3. Consultamos el padrón oficial de AFIP (ws_sr_padron_a5)
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
    return NextResponse.json({ success: false, error: "CUIT no alcanzado por el padrón o error de conexión." }, { status: 500 })
  }
}