"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Loader2, ArrowLeft, Printer, ShieldAlert, Microscope, Calendar } from "lucide-react"
import Link from "next/link"
import supabase from "@/lib/supabase"

export default function GuiaDetailPage() {
  const { id } = useParams()
  const [guia, setGuia] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchGuia() {
      if (!id) return
      const { data } = await supabase.from("guias").select("*").eq("id", id).single()
      if (data) setGuia(data)
      setIsLoading(false)
    }
    fetchGuia()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-center">
        <Loader2 className="size-10 animate-spin text-cyan-rx" />
      </div>
    )
  }

  if (!guia) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center bg-background px-6">
        <h2 className="font-heading text-2xl font-bold text-primary">Protocolo no encontrado</h2>
        <Link href="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">
          Volver al inicio
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* 🚀 El header se mantiene azul sólido para que se lea perfecto */}
      <SiteHeader />
      
      <main className="bg-background min-h-screen pt-32 pb-24 text-left">
        <div className="mx-auto max-w-4xl px-6">
          
          <Link href="/#catalogo" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-10 print:hidden">
            <ArrowLeft className="size-4" /> Volver al catálogo
          </Link>

          {/* CABECERA CIENTÍFICA */}
          <div className="border-b border-border pb-6 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-rx text-xs font-black uppercase tracking-widest mb-3">
                <Microscope className="size-4" /> Protocolo de Investigación Química
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl max-w-2xl">
                {guia.titulo}
              </h1>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 font-medium">
                <span className="flex items-center gap-1"><Calendar className="size-3.5"/> Código de Validación: #PR-{guia.id.toUpperCase()}</span>
              </div>
            </div>

            <button 
              onClick={() => window.print()}
              className="print:hidden inline-flex items-center justify-center gap-2 rounded-xl bg-muted/60 border border-border px-4 py-2.5 text-xs font-bold uppercase text-primary hover:bg-cyan-rx/20 transition-all shadow-sm"
            >
              <Printer className="size-4" /> Imprimir Documento
            </button>
          </div>

          {/* CUERPO DEL CONTENIDO TEXTUAL DINÁMICO PROCESADO */}
            <article className="prose prose-cyan max-w-none mb-16 text-base text-muted-foreground leading-relaxed text-balance font-medium">
              <div 
                 className="rich-text-content [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#081640] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-md [&_h3]:font-semibold [&_h3]:text-[#081640] [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1"
                 dangerouslySetInnerHTML={{ __html: guia.contenido || "" }} 
                 />
             </article>

          {/* CLÁUSULA DE RESPONSABILIDAD BIOTECNOLÓGICA */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <ShieldAlert className="size-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">
                  Aviso de Seguridad en Laboratorio
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Este protocolo describe pautas estrictamente analíticas orientadas al modelado molecular y ensayos in vitro. Las metodologías expuestas deben ejecutarse bajo supervisión de personal certificado en entornos biotecnológicos autorizados. RxWellHealth no se responsabiliza por desvíos o mala praxis de las normativas de bioseguridad del laboratorio.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}