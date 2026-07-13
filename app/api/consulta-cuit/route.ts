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
    
    // 2. Instanciamos la AFIP limpiamente, sin tokens comerciales, solo para uso criptográfico local
    const afip = new Afip({
      CUIT: 27232392628,
      cert: certContenido,
      key: keyContenido,
      production: true,
      ta_folder: "/tmp",
      res_folder: "/tmp"
    })

    // 🚀 EL FIX MAESTRO: Usamos la librería SOLO para obtener la firma local (TA). 
    // Esto funciona 100% offline y gratis.
    const ta = await afip.GetServiceTA('ws_sr_padron_a5');

    // 🚀 ARMAMOS EL PAQUETE A MANO: Esquivamos todos los bugs de la librería
    const soapUrl = "https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA5";
    const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:a5="http://a5.soap.ws.server.puc.sr/">
       <soapenv:Header/>
       <soapenv:Body>
          <a5:getPersona>
             <token>${ta.token}</token>
             <sign>${ta.sign}</sign>
             <cuitRepresentada>27232392628</cuitRepresentada>
             <idPersona>${Number(cuit)}</idPersona>
          </a5:getPersona>
       </soapenv:Body>
    </soapenv:Envelope>`;

    // 🚀 DISPARAMOS DIRECTO AL GOBIERNO ARGENTINO
    const response = await fetch(soapUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        "SOAPAction": "getPersona"
      },
      body: soapBody
    });

    const xml = await response.text();

    // 4. Función rústica pero infalible para leer la respuesta en XML
    const extractTag = (tag: string, xmlString: string) => {
      const match = xmlString.match(new RegExp(`<([^:>]+:)?${tag}>(.*?)</([^:>]+:)?${tag}>`, 'i'));
      return match ? match[2] : null;
    };

    // Si la AFIP nos tira bronca (ej: No tenés el servicio delegado en la web), te lo muestro en pantalla
    const fault = extractTag('faultstring', xml);
    if (fault) {
       throw new Error(fault);
    }

    const razonSocial = extractTag('razonSocial', xml);
    const nombre = extractTag('nombre', xml);
    const apellido = extractTag('apellido', xml);

    const nombreFinal = razonSocial || `${apellido || ""} ${nombre || ""}`.trim();

    if (!nombreFinal) {
      return NextResponse.json({ success: false, error: "AFIP no devolvió una Razón Social para este CUIT." })
    }

    return NextResponse.json({
      success: true,
      nombre: nombreFinal
    })

  } catch (error: any) {
    console.error("Error en Padrón AFIP:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Error al conectar directo con AFIP." 
    }, { status: 500 })
  }
}