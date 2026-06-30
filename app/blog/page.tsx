"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Loader2, FileText, ArrowRight, HelpCircle, Shield, CreditCard, Info, Search } from "lucide-react"
import Link from "next/link"
import supabase from "@/lib/supabase"

export default function BlogGeneralPage() {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("") // 🚀 ESTADO DEL BUSCADOR

  useEffect(() => {
    async function fetchBlogs() {
      const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false })
      if (data) setItems(data)
      setIsLoading(false)
    }
    fetchBlogs()
  }, [])

  const obtenerIcono = (cat: string) => {
    if (cat === "Preguntas Frecuentes") return <HelpCircle className="size-5 text-cyan-rx" />
    if (cat === "Formas de Pago") return <CreditCard className="size-5 text-cyan-rx" />
    if (cat === "Sobre Nosotros") return <Shield className="size-5 text-cyan-rx" />
    return <Info className="size-5 text-cyan-rx" />
  }

  // 🚀 LÓGICA DE FILTRADO EN TIEMPO REAL
  const itemsFiltrados = items.filter((item) => 
    item.titulo?.toLowerCase().includes(busqueda.toLowerCase()) || 
    item.categoria?.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.contenido?.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="size-10 animate-spin text-cyan-rx" /></div>
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-[#f8faff] min-h-screen pt-32 pb-24 text-left">
        <div className="mx-auto max-w-5xl px-6">
          
          {/* 🚀 CABECERA CON EL BUSCADOR INTEGRADO */}
          <div className="mb-12 border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-[#081640]">Centro de Soporte e Información</h1>
              <p className="text-sm text-muted-foreground mt-2">Novedades corporativas, instructivos analíticos y preguntas frecuentes de Pepti-Age.</p>
            </div>
            
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-primary/40" />
              <input 
                type="text" 
                placeholder="Buscar artículos, guías, envíos..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-white border border-silver/30 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-cyan-rx focus:ring-1 focus:ring-cyan-rx transition-all text-[#081640] shadow-sm"
              />
            </div>
          </div>

          {itemsFiltrados.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {itemsFiltrados.map((item) => (
                <Link href={`/blog/${item.id}`} key={item.id} className="group block bg-white p-6 rounded-2xl border border-silver/20 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-[#081640]/5 rounded-xl border border-[#081640]/10 group-hover:bg-[#081640] group-hover:text-white transition-colors shrink-0">
                      {obtenerIcono(item.categoria)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-rx block mb-1">{item.categoria}</span>
                      <h3 className="font-heading text-lg font-bold text-[#081640] tracking-tight leading-snug group-hover:text-cyan-rx transition-colors">{item.titulo}</h3>
                      <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary/40 uppercase tracking-wider group-hover:text-primary transition-colors">
                        Leer artículo completo <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* 🚀 ESTADO VACÍO SI NO ENCUENTRA NADA */
            <div className="text-center py-16 bg-white border border-dashed border-silver/30 rounded-3xl">
              <FileText className="mx-auto size-12 text-primary/20 mb-4" />
              <h3 className="text-base font-bold text-[#081640]">Sin resultados</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No encontramos ningún artículo que coincida con "{busqueda}".
              </p>
              <button onClick={() => setBusqueda("")} className="mt-4 text-xs font-bold uppercase text-cyan-rx hover:text-[#081640] transition-colors">
                Limpiar búsqueda
              </button>
            </div>
          )}

        </div>
      </main>
    </>
  )
}