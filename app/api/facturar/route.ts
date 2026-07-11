import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
// @ts-ignore
import Afip from "@afipsdk/afip.js"

export async function POST(request: Request) {
  try {
    const { totalARS, clienteNombre, clienteDNI } = await request.json()

    // 1. Resolvemos las rutas absolutas de tus llaves
    const rootCertsDir = path.join(process.cwd(), "afip_certs")
    const keyPath = path.join(rootCertsDir, "privada.key")
    const certPath = path.join(rootCertsDir, "certificado.crt")

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      return NextResponse.json(
        { success: false, error: "Faltan los archivos key o crt en la carpeta afip_certs (Raíz)" },
        { status: 500 }
      )
    }

    // 🚀 NUEVO: Leemos el CONTENIDO real de los archivos de texto
    const certContenido = fs.readFileSync(certPath, "utf-8")
    const keyContenido = fs.readFileSync(keyPath, "utf-8")

    // 2. 🚀 COMPLETAMENTE CONFIGURADO PARA VERCEL (Con contenidos y carpeta /tmp)
    const afip = new (Afip as any)({
      CUIT: 27232392628,
      cert: certContenido, // 👈 CAMBIADO: Ahora le pasamos el contenido del archivo
      key: keyContenido,   // 👈 CAMBIADO: Ahora le pasamos el contenido del archivo
      production: true,
      access_token: "TU_TOKEN_DE_AFIPSDK", // 👈 Tu token real
      ta_folder: "/tmp",   
      res_folder: "/tmp"
    })

    // 3. Obtenemos el próximo número de comprobante disponible de AFIP
    const PUNTO_VENTA = 10 
    const TIPO_COMPROBANTE = 11 // 11 significa Factura C

    const lastVoucher = await afip.ElectronicBilling.getLastVoucher(PUNTO_VENTA, TIPO_COMPROBANTE)
    const proximoNumero = lastVoucher + 1

    // 4. 🚀 BLINDADO: Fecha en YYYYMMDD clavada con hora local argentina (evita rebotes horarios)
    const opcionesFecha = { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' } as const
    const formateador = new Intl.DateTimeFormat('fr-CA', opcionesFecha)
    const fechaHoyYMD = parseInt(formateador.format(new Date()).replace(/-/g, ""))

    const payloadAFIP = {
      CantReg: 1,
      PtoVta: PUNTO_VENTA,
      CbteTipo: TIPO_COMPROBANTE,
      Concepto: 1, // 1 = Productos
      DocTipo: clienteDNI ? 96 : 99, // 96 = DNI, 99 = Consumidor Final
      DocNro: clienteDNI ? parseInt(clienteDNI) : 0,
      CbteDesde: proximoNumero,
      CbteHasta: proximoNumero,
      CbteFch: fechaHoyYMD,
      ImpTotal: Math.round(totalARS),
      ImpTotConc: 0,
      ImpNeto: Math.round(totalARS),
      ImpOpEx: 0,
      ImpIVA: 0,
      ImpTrib: 0,
      MonId: "PES",
      MonCotiz: 1
    }

    // 5. Despachamos a los servidores de AFIP
    const resultado = await afip.ElectronicBilling.createVoucher(payloadAFIP)

    return NextResponse.json({
      success: true,
      cae: resultado.CAE,
      vencimiento: resultado.CAEFchVto,
      nroComprobante: proximoNumero,
      puntoVenta: PUNTO_VENTA
    })

  } catch (error: any) {
    console.error("AFIP Error Crítico:", error)
    
    // 🚀 PERFECCIONADO: Si el servidor devuelve un JSON con el error, lo leemos completo
    let detalleAFIP = error.message
    if (error.response && error.response.data) {
      detalleAFIP = typeof error.response.data === 'object'
        ? JSON.stringify(error.response.data)
        : error.response.data.toString()
    }

    return NextResponse.json(
      { success: false, error: detalleAFIP },
      { status: 500 }
    )
  }
}