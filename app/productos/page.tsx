"use client"

import { useState, useEffect } from "react"
import { Loader2, Smartphone, Search, ChevronRight, ShoppingCart, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/context/cart-context"
import { SiteHeader } from "@/components/site-header"
import { CartDrawer } from "@/components/cart-drawer"
import Link from "next/link"
import supabase from "@/lib/supabase"

interface Producto {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  imagen_url: string
  precio: number
  precio_minorista: number
  stock: number
  visible_web?: boolean
}

export default function CatalogoGeneralPage() {
  const [products, setProducts] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [isCartOpen, setIsCartOpen] = useState(false)

  const { addToCart, cart } = useCart()
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function fetchTodosLosProductos() {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("visible_web", true) // 🚀 FILTRO CLAVE: El público general solo ve los aprobados
        .order("created_at", { ascending: false })

      if (!error && data) setProducts(data as Producto[])
      setIsLoading(false)
    }
    fetchTodosLosProductos()
  }, [])

  // Extraemos dinámicamente todas las categorías que creaste en tu panel de administración
  const categoriasDisponibles = ["Todos", ...Array.from(new Set(products.map((p) => p.categoria))).filter(Boolean)]

  // 🚀 LÓGICA DE FILTRADO COMBINADO (Buscador + Menú de Categorías)
  const productosFiltrados = products.filter((p) => {
    const matchesCategory = selectedCategory === "Todos" || p.categoria === selectedCategory
    const matchesSearch = p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || p.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddToCart = (product: Producto) => {
    const precioPublico = product.precio_minorista ?? product.precio
    addToCart({ id: product.id, name: product.nombre, price: precioPublico, stock: product.stock })
    setAddedItems((prev) => ({ ...prev, [product.id]: true }))
    setTimeout(() => { setAddedItems((prev) => ({ ...prev, [product.id]: false })) }, 2000)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-center">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">Abriendo Catálogo...</p>
      </div>
    )
  }

  return (
    <>
      <SiteHeader onOpenCart={() => setIsCartOpen(true)} />
      
      <main className="bg-background min-h-screen pt-32 pb-24 text-left">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          
          {/* ENCABEZADO */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8 mb-10">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter text-foreground">Catálogo General</h1>
              <p className="text-sm text-muted-foreground mt-2">Explorá todos nuestros equipos y accesorios con stock inmediato.</p>
            </div>
            
            {/* BUSCADOR */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="¿Qué estás buscando?..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-border bg-white pl-11 pr-4 py-3 text-sm font-medium outline-none focus:border-primary shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
            
            {/* MENÚ DE CATEGORÍAS LATERAL (Estilo Apple Store) */}
            <aside className="lg:col-span-1 lg:sticky lg:top-32 space-y-2 bg-muted/30 p-4 rounded-3xl border border-border">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-4">Filtrar por Categoría</span>
              {categoriasDisponibles.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-all group active:scale-98",
                    selectedCategory === cat 
                      ? "bg-foreground text-white shadow-sm" 
                      : "text-foreground/70 hover:bg-white hover:text-foreground border border-transparent hover:border-border"
                  )}
                >
                  <span>{cat}</span>
                  <ChevronRight className={cn("size-4 opacity-0 group-hover:opacity-100 transition-all", selectedCategory === cat && "opacity-100 text-white")} />
                </button>
              ))}
            </aside>

            {/* GRILLA DE ARTÍCULOS */}
            <div className="lg:col-span-3">
              {productosFiltrados.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-border py-24 text-center bg-muted/10">
                  <Smartphone className="mx-auto size-16 text-muted-foreground/20 mb-4" />
                  <h3 className="text-xl font-bold text-foreground">No encontramos resultados</h3>
                  <p className="text-sm text-muted-foreground mt-1">Probá cambiando el filtro o la palabra de búsqueda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {productosFiltrados.map((p) => {
                    const isAdded = addedItems[p.id]
                    const precioPublico = p.precio_minorista ?? p.precio
                    const isPhone = p.categoria?.toLowerCase().includes("iphone") || p.nombre?.toLowerCase().includes("iphone")

                    return (
                      <article key={p.id} className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-border bg-white transition-all hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <Link href={`/productos/${p.id}`} className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center p-6 cursor-pointer">
                          {p.imagen_url ? (
                            <img src={p.imagen_url} alt={p.nombre} className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-103" />
                          ) : (
                            <Smartphone className="size-14 text-muted-foreground/20" />
                          )}
                          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground shadow-sm">{p.categoria}</span>
                        </Link>

                        <div className="flex flex-1 flex-col justify-between p-6">
                          <Link href={`/productos/${p.id}`} className="block group-hover:text-primary transition-colors cursor-pointer">
                            <h3 className="text-base font-bold tracking-tight text-foreground line-clamp-1">{p.nombre}</h3>
                            <div className="mt-2 text-xs text-muted-foreground line-clamp-2 min-h-[32px]" dangerouslySetInnerHTML={{ __html: p.descripcion }} />
                          </Link>
                          
                          <div className="mt-4 pt-4 border-t border-border flex flex-col gap-4">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Precio público</span>
                              <span className="text-xl font-bold tracking-tight text-foreground">USD {precioPublico.toLocaleString("en-US")}</span>
                            </div>

                            {isPhone ? (
                              <Link href={`/productos/${p.id}`} className="w-full flex items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-xs font-bold text-white shadow-sm hover:bg-primary transition-all">
                                Ver Stock & Cotización
                              </Link>
                            ) : (
                              <button 
                                onClick={() => handleAddToCart(p)} 
                                disabled={isAdded || p.stock < 1} 
                                className={cn(
                                  "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all active:scale-95", 
                                  isAdded ? "bg-emerald-500 text-white" : "bg-muted text-foreground hover:bg-primary hover:text-white"
                                )}
                              >
                                {isAdded ? "Agregado" : "Comprar artículo"}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}