"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Loader2, ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import supabase from "@/lib/supabase"

export default function BlogDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchArticle() {
      if (!id) return
      const { data } = await supabase.from("blogs").select().eq("id", id).single()
      if (data) setArticle(data)
      setIsLoading(false)
    }
    fetchArticle()
  }, [id])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="size-10 animate-spin text-cyan-rx" /></div>
  }

  if (!article) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center bg-background px-6">
        <h2 className="font-heading text-2xl font-bold text-primary">Contenido no encontrado</h2>
        <Link href="/blog" className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">Volver al Centro de Soporte</Link>
      </div>
    )
  }

  // 🚀 MENSAJE DE WHATSAPP DINÁMICO COMPLETAMENTE AUTOMATIZADO
  const numeroSoporte = "5493812184858" // <-- REEMPLAZÁ CON TU TELÉFONO DE WHATSAPP CON CÓDIGO DE PAÍS
  const mensajeBase = `Hola Pepti-Age, estoy revisando el apartado informativo sobre "${article.titulo}" en su web y me gustaría realizar una consulta personalizada.`
  const whatsappUrl = `https://wa.me/${numeroSoporte}?text=${encodeURIComponent(mensajeBase)}`

  return (
    <>
      <SiteHeader />
      <main className="bg-background min-h-screen pt-32 pb-24 text-left">
        <div className="mx-auto max-w-3xl px-6">
          
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="size-4" /> Volver al centro de soporte
          </Link>

          <div className="border-b border-border pb-6 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-rx bg-cyan-rx/5 border border-cyan-rx/10 px-2.5 py-1 rounded-md">{article.categoria}</span>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl mt-4 leading-tight">
              {article.titulo}
            </h1>
          </div>

          {/* CUERPO INTERPRETADOR DEL CÓDIGO INTERACTIVO */}
          <article className="prose prose-cyan max-w-none mb-12 text-base text-muted-foreground leading-relaxed text-balance font-medium">
            <div 
              className="rich-blog-content [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#081640] [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-md [&_h3]:font-semibold [&_h3]:text-[#081640] [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1"
              dangerouslySetInnerHTML={{ __html: article.contenido || "" }} 
            />
          </article>

          {/* 🟢 BOTÓN INTELIGENTE DE WHATSAPP */}
          <div className="border-t border-border pt-8 mt-12">
            <div className="bg-[#25D366]/5 rounded-2xl border border-[#25D366]/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#081640] uppercase tracking-wider">¿Aún tenés dudas sobre este apartado?</h4>
                <p className="text-xs text-muted-foreground mt-1">Conectate de forma directa con un asesor técnico de nuestro laboratorio clínico.</p>
              </div>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 hover:bg-[#128C7E] transition-all shadow-md shrink-0"
              >
                <MessageSquare className="size-4 shrink-0" /> Contactar por WhatsApp
              </a>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}