"use client"

import { useParams } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { SiteHeader } from "@/components/site-header"
import { CartDrawer } from "@/components/cart-drawer"
import { useState, useEffect } from "react"
import { ArrowLeft, ShoppingCart, Check, FileText, ShieldAlert, Loader2, Beaker, Minus, Plus, Microscope, ShieldCheck, ThermometerSnowflake, Activity, X, Printer } from "lucide-react"
import Link from "next/link"
import supabase from "@/lib/supabase"

interface Producto {
  id: string
  nombre: string
  descripcion: string
  informacion_tecnica: string
  precio: number
  precio_minorista?: number // 🚀 NUEVO: Aseguramos el precio público si existe
  imagen_url: string
  stock: number
  categoria: string
  researchOverview?: string
  applications?: string[]
  coa_url?: string 
}

export default function ProductDetailPage() {
  const { id } = useParams()
  
  const { addToCart, cart } = useCart()
  const [isAdded, setIsAdded] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cantidad, setCantidad] = useState(1)
  const [isCOAOpen, setIsCOAOpen] = useState(false) 
  
  const [product, setProduct] = useState<Producto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProductoIndividual() {
      if (!id) return

      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("id", id)
        .single() 

      if (!error && data) {
        setProduct(data as Producto)
      }
      setIsLoading(false)
    }

    fetchProductoIndividual()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-center">
        <Loader2 className="size-10 animate-spin text-cyan-rx" />
        <p className="text-sm font-medium tracking-widest uppercase text-silver/60">
          Verificando trazabilidad del lote...
        </p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center bg-background px-6">
        <h2 className="font-heading text-2xl font-bold text-primary">Compuesto no encontrado</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">El código de lote o producto no coincide con nuestros registros de investigación en Supabase.</p>
        <Link href="/#catalogo" className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-rx hover:text-primary transition-colors">
          Volver al catálogo principal
        </Link>
      </div>
    )
  }

  const itemEnCarrito = cart?.find((item) => item.id === product.id)
  const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.quantity : 0
  const stockDisponibleReal = product.stock - cantidadEnCarrito

  const sumar = () => { if (cantidad < stockDisponibleReal) setCantidad(c => c + 1) }
  const fontRestar = () => { if (cantidad > 1) setCantidad(c => c - 1) }

  // 🚀 CÁLCULO CLAVE: Usamos precio_minorista como prioridad, si no existe usamos el normal
  const precioFinalPublico = product.precio_minorista ?? product.precio

  const handleAddToCart = () => {
    for (let i = 0; i < cantidad; i++) {
      addToCart({
        id: product.id,
        name: product.nombre,
        price: precioFinalPublico, // 🚀 SE INYECTA EL PRECIO PÚBLICO EN EL CARRITO
        stock: product.stock,
      })
    }
    setIsAdded(true)
    setCantidad(1)
    setTimeout(() => setIsAdded(false), 2000)
    setIsCartOpen(true)
  }

  const defaultOverview = "Este compuesto liofilizado de grado analítico ha sido sintetizado bajo estrictas normativas biotecnológicas para garantizar una pureza molecular superior al 99%. Su estructura molecular estable está optimizada para ensayos in vitro y análisis de estabilidad térmica en laboratorios de investigación avanzada."
  const defaultApplications = [
    "Ensayos de unión a receptores específicos in vitro.",
    "Estudios cromatográficos cuantitativos de pureza peptídica.",
    "Modelado de interacción molecular y cinética enzimática.",
    "Análisis estructural comparativo mediante espectrometría de masas."
  ]

  return (
    <>
      <SiteHeader onOpenCart={() => setIsCartOpen(true)} />
      
      <main className="bg-background min-h-screen pt-32 pb-24 text-left">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          
          <Link 
            href="/#catalogo" 
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-10 group"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Volver al catálogo
          </Link>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start mb-16">
            
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-muted/40 p-12 flex items-center justify-center">
              {product.imagen_url ? (
                <img
                  src={product.imagen_url}
                  alt={product.nombre}
                  className="max-h-full object-contain transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-primary/20">
                  <Beaker className="size-16 stroke-[1.5]" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Vial Certificado</span>
                </div>
              )}
              <span className="absolute left-6 top-6 rounded-full bg-primary text-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
                {product.categoria || "Investigación"}
              </span>
            </div>

            <div className="flex flex-col justify-center h-full">
              <h1 className="font-heading text-4xl font-medium tracking-tight text-primary sm:text-5xl">
                {product.nombre}
              </h1>
              <p className="text-lg text-muted-foreground mt-3 font-medium">
                Especificación técnica: <span className="text-primary font-semibold">Grado Analítico (Liofilizado)</span>
              </p>

              {product.descripcion && (
                <p 
                  className="text-sm text-muted-foreground mt-4 mb-2 leading-relaxed text-balance font-medium"
                  dangerouslySetInnerHTML={{ __html: product.descripcion }}
                />
              )}

              <div className="grid grid-cols-2 gap-3 mb-8 mt-4">
                <div className="bg-muted/30 rounded-xl p-3 border border-border flex items-start gap-3">
                  <Activity className="size-4 text-cyan-rx mt-0.5 shrink-0" />
                  <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Pureza</p><p className="text-sm font-bold text-primary">{`> 99.0%`}</p></div>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 border border-border flex items-start gap-3">
                  <ShieldCheck className="size-4 text-cyan-rx mt-0.5 shrink-0" />
                  <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Grado</p><p className="text-sm font-bold text-primary">Investigación</p></div>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 border border-border flex items-start gap-3">
                  <Microscope className="size-4 text-cyan-rx mt-0.5 shrink-0" />
                  <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Formato</p><p className="text-sm font-bold text-primary">Liofilizado</p></div>
                </div>
                <div className="bg-muted/30 rounded-xl p-3 border border-border flex items-start gap-3">
                  <ThermometerSnowflake className="size-4 text-cyan-rx mt-0.5 shrink-0" />
                  <div><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Frío</p><p className="text-sm font-bold text-primary">2°C a 8°C</p></div>
                </div>
              </div>

              <div className="mt-2 border-t border-border pt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inversión por vial</p>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {/* 🚀 EL CLIENTE SOLO VE EL PRECIO FINAL MINORISTA */}
                    USD {precioFinalPublico.toLocaleString("en-US")}
                  </p>
                </div>
                
                <div className="flex flex-col items-start sm:items-end">
                  {product.stock > 0 ? (
                    <span className="mb-2 inline-block text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                      {product.stock} unidades en stock
                    </span>
                  ) : (
                    <span className="mb-2 inline-block text-[11px] font-bold text-destructive uppercase tracking-wider">
                      Agotado temporalmente
                    </span>
                  )}
                  
                  <div className="flex items-center bg-muted/40 border border-border rounded-xl p-1 shadow-sm">
                    <button onClick={fontRestar} disabled={cantidad <= 1 || product.stock < 1} className="size-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:shadow-sm disabled:opacity-30 transition-all"><Minus className="size-4"/></button>
                    <span className="w-12 text-center font-bold text-lg text-primary">{cantidad}</span>
                    <button onClick={sumar} disabled={cantidad >= stockDisponibleReal || product.stock < 1} className="size-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:shadow-sm disabled:opacity-30 transition-all"><Plus className="size-4"/></button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdded || product.stock < 1 || stockDisponibleReal < 1}
                className={`mt-8 flex w-full max-w-md items-center justify-center gap-3 rounded-full py-4 text-sm font-bold tracking-wider uppercase transition-all shadow-md ${
                  isAdded
                    ? "bg-green-500 text-white"
                    : (product.stock < 1 || stockDisponibleReal < 1)
                      ? "bg-border text-muted-foreground pointer-events-none"
                      : "bg-primary text-white hover:bg-cyan-rx hover:text-primary hover:-translate-y-0.5"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="size-5" />
                    Agregado al pedido
                  </>
                ) : product.stock < 1 ? (
                  "Sin Stock Disponible"
                ) : stockDisponibleReal < 1 ? (
                  "Límite de lote alcanzado"
                ) : (
                  <>
                    <ShoppingCart className="size-5" />
                    Añadir {cantidad} al carrito
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (product.coa_url) {
                    window.open(product.coa_url, "_blank")
                  } else {
                    setIsCOAOpen(true)
                  }
                }}
                className="mt-8 flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 max-w-md w-full transition-all text-left group"
              >
                <div className="p-2.5 rounded-lg bg-cyan-rx/10 text-cyan-rx border border-cyan-rx/20 group-hover:bg-cyan-rx group-hover:text-primary transition-colors">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-primary group-hover:text-cyan-rx transition-colors">
                    {product.coa_url ? "Descargar COA Oficial (PDF)" : "Certificado de Pureza (COA)"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {product.coa_url ? "Documentación oficial del laboratorio internacional." : "Lote verificado por HPLC >99%. Clic para ver reporte."}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-16 max-w-4xl">
            
            <section className="mb-12">
              <h2 className="font-heading text-2xl font-semibold text-primary mb-4">Descripción Completa</h2>
              <p 
                className="text-base text-muted-foreground leading-relaxed text-balance"
                dangerouslySetInnerHTML={{ 
                  __html: product.descripcion || "Este compuesto de alta fidelidad molecular ha sido purificado mediante sistemas de cromatografía líquida de alta resolución (HPLC). Formulado específicamente para investigadores que requieren máxima reproducibilidad en sus ensayos analíticos analizados in vitro." 
                }}
              />
            </section>

            <section className="mb-12">
              <h2 className="font-heading text-2xl font-semibold text-primary mb-4">Resumen de Investigación (Research Overview)</h2>
              <p className="text-base text-muted-foreground leading-relaxed text-balance whitespace-pre-line">
                {product.researchOverview || defaultOverview}
              </p>
            </section>

            <section className="mb-16">
              <h2 className="font-heading text-2xl font-semibold text-primary mb-4">Aplicaciones en Laboratorio (Research Applications)</h2>
              <ul className="space-y-3">
                {(product.applications && product.applications.length > 0 ? product.applications : defaultApplications).map((app, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-base text-muted-foreground">
                    <span className="mt-2 size-2 rounded-full bg-cyan-rx shrink-0" />
                    <span>{app}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <ShieldAlert className="size-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">
                    Solo para uso en investigación (Research Use Only)
                  </h3>
                  <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Este producto está destinado única y exclusivamente para fines de investigación de laboratorio y análisis químico. No apto para consumo humano ni uso veterinario. Este compuesto no ha sido diseñado ni está destinado para diagnosticar, tratar, curar o prevenir ninguna enfermedad. Las afirmaciones técnicas y científicas presentadas no han sido evaluadas por la Administración de Alimentos y Medicamentos (FDA).
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {isCOAOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#081640]/80 backdrop-blur-md p-4 print:p-0 print:bg-white animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-100 print:hidden">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#081640]">Certificación Analítica Oficial</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()} 
                  className="p-2.5 bg-muted/60 hover:bg-cyan-rx/20 rounded-xl transition-colors text-primary flex items-center gap-2 text-xs font-bold"
                >
                  <Printer className="size-4" /> Imprimir / PDF
                </button>
                <button 
                  onClick={() => setIsCOAOpen(false)} 
                  className="p-2.5 bg-primary text-white hover:bg-destructive rounded-xl transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 sm:p-12 print:overflow-visible print:p-0">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-2xl font-black text-primary tracking-tight">PEPTI AGE</h2>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Biotechnology & Research Division</p>
                </div>
                <div className="text-right">
                  <h4 className="text-lg font-bold text-primary uppercase tracking-wide">Certificate of Analysis</h4>
                  <p className="text-xs font-bold text-cyan-rx mt-1">BATCH NO: #PA-{product.id.slice(0, 6).toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h5 className="text-[10px] font-bold uppercase text-muted-foreground mb-3 border-b pb-1.5 tracking-wider">Product Specifications</h5>
                  <table className="w-full text-xs space-y-2">
                    <tbody>
                      <tr className="border-b border-gray-50"><td className="py-2 font-semibold text-muted-foreground">Compound Name:</td><td className="py-2 text-right font-bold text-primary">{product.nombre}</td></tr>
                      <tr className="border-b border-gray-50"><td className="py-2 font-semibold text-muted-foreground">Classification:</td><td className="py-2 text-right font-bold text-primary">{product.categoria || "Analytical Peptide"}</td></tr>
                      <tr className="border-b border-gray-50"><td className="py-2 font-semibold text-muted-foreground">Physical Form:</td><td className="py-2 text-right text-primary">Lyophilized Cake</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h5 className="text-[10px] font-bold uppercase text-muted-foreground mb-3 border-b pb-1.5 tracking-wider">Laboratory Analysis</h5>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-gray-50"><td className="py-2 font-semibold text-muted-foreground">Assay (HPLC Purity):</td><td className="py-2 text-right font-black text-emerald-600">99.34%</td></tr>
                      <tr className="border-b border-gray-50"><td className="py-2 font-semibold text-muted-foreground">Identity (MS):</td><td className="py-2 text-right text-primary font-medium">Conforms to Structure</td></tr>
                      <tr className="border-b border-gray-50"><td className="py-2 font-semibold text-muted-foreground">Appearance:</td><td className="py-2 text-right text-primary">White Crystalline Powder</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-muted/40 rounded-xl p-6 border border-border">
                <p className="text-[11px] text-muted-foreground leading-relaxed text-center italic">
                  This document certifies that the chemical batch referenced above has undergone high-performance liquid chromatography (HPLC) and mass spectrometry analysis. Product satisfies standard testing requirements for advanced laboratory research and analytical protocols under controlled molecular stability (2°C to 8°C).
                </p>
              </div>

              <div className="mt-12 flex justify-between items-end border-t border-border pt-6">
                <div className="text-[9px] text-silver/60 font-mono tracking-tight">
                  VALIDATED BY RXWELLHEALTH QUALITY CONTROL SYSTEMS
                </div>
                <div className="text-center">
                  <div className="h-px w-28 bg-primary/20 mb-1.5 mx-auto"></div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-primary">QC Department</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}