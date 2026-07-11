import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"
// @ts-ignore
import Afip from "@afipsdk/afip.js"

export async function POST(request: Request) {
  try {
    const { totalARS, clienteNombre, clienteDNI } = await request.json()

    // 1. Resolvemos las rutas absolutas de tus llaves en la Mac/Servidor
    const rootCertsDir = path.join(process.cwd(), "afip_certs")
    const keyPath = path.join(rootCertsDir, "privada.key")
    const certPath = path.join(rootCertsDir, "certificado.crt")

    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      return NextResponse.json(
        { success: false, error: "Faltan los archivos key o crt en la carpeta afip_certs" },
        { status: 500 }
      )
    }

    // 2. Inicializamos el SDK de AFIP con tu CUIT de producción
    const afip = new (Afip as any)({
     CUIT: 27232392628,
     cert: certPath,
     key: keyPath,
     production: true 
})

    // 3. Obtenemos el próximo número de comprobante disponible de AFIP
    const PUNTO_VENTA = 10 // 👈 ⚠️ REEMPLAZÁ EL 2 POR EL NÚMERO QUE CREASTE EN EL PASO 4 DE AFIP
    const TIPO_COMPROBANTE = 11 // 11 significa Factura C

    const lastVoucher = await afip.ElectronicBilling.getLastVoucher(PUNTO_VENTA, TIPO_COMPROBANTE)
    const proximoNumero = lastVoucher + 1

    // 4. Estructuramos el pedido oficial bajo normas estrictas de AFIP
    const fechaHoyYMD = parseInt(new Date().toISOString().replace(/-/g, "").split("T")[0])

    const payloadAFIP = {
      CantReg: 1,
      PtoVta: PUNTO_VENTA,
      CbteTipo: TIPO_COMPROBANTE,
      Concepto: 1, // 1 = Productos (Accesorios/iPhones)
      DocTipo: clienteDNI ? 96 : 99, // 96 = DNI, 99 = Consumidor Final sin identificar
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
      MonId: "PES", // Moneda oficial de mostrador: Pesos Argentinos
      MonCotiz: 1
    }

    // 5. Despachamos a los servidores de AFIP para que nos devuelva el CAE
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
    return NextResponse.json(
      { success: false, error: error.message || "Error de comunicación con el WS de AFIP" },
      { status: 500 }
    )
  }
}