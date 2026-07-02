"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, ShoppingCart, Check, Loader2, Smartphone, ArrowRight } from "lucide-react" 
import { cn } from "@/lib/utils"
import { useCart } from "@/context/cart-context"
import Link from "next/link"
import supabase from "@/lib/supabase"

type Category =
  | "iPhone"
  | "Accesorios"
  | "Auriculares"
  | "Cargadores & Cables"
  | "Gaming"

const filters: ("Todos" | Category)[] = [
  "Todos",
  "iPhone",
  "Accesorios",
  "Auriculares",
  "Cargadores & Cables",
  "Gaming",
]

type Product = {
  id: string
  nombre: string
  descripcion: string
  categoria: Category
  imagen_url: string
  precio: number 
  precio_minorista: number 
  stock: number
}

export function Catalog() {
  const [active, setActive] = useState<(typeof filters)[number]>("Todos")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const { addToCart, cart } = useCart()
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function fetchProductos() {
      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre, descripcion, categoria, imagen_url, precio, precio_minorista, stock")
        .order("created_at", { ascending: false }) // Trae los más nuevos primero

      if (!error && data) {
        setProducts(data as Product[])
      }
      setIsLoading(false)
    }

    fetchProductos()
  }, [])

  // 🚀 LA MAGIA ESTÁ ACÁ: Filtramos por categoría, pero le decimos con .slice(0, 8) que SOLO muestre un máximo de 8 tarjetas
  const visible = (active === "Todos" ? products : products.filter((p) => p.categoria === active)).slice(0, 8)

  const handleAddToCart = (product: Product) => {
    const precioPublico = product.precio_minorista ?? product.precio
    
   addToCart({ id: product.id, name: product.nombre, price: precioPublico, stock: product.stock, category: product.categoria })
    setAddedItems((prev) => ({ ...prev, [product.id]: true }))
    setTimeout(() => { setAddedItems((prev) => ({ ...prev, [product.id]: false })) }, 2000)
  }

  if (isLoading) {
    return (
      <section id="catalogo" className="bg-background py-24 lg:py-32 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Sincronizando inventario...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="catalogo" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        
        {/* ENCABEZADO DE DESTACADOS */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
              <span className="h-px w-10 bg-primary/60" />
              Vidriera Electronic
            </p>
            <h2 className="text-4xl font-bold leading-tight tracking-tighter text-foreground text-balance sm:text-5xl">
              Productos Destacados
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button key={f} type="button" onClick={() => setActive(f)} className={cn("rounded-full border px-4 py-2 text-xs font-semibold tracking-tight transition-all", active === f ? "border-primary bg-primary text-white shadow-md" : "border-border bg-white text-foreground hover:border-muted-foreground/30")}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* GRILLA DE PRODUCTOS (Limitada a 8) */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => {
            const isAdded = addedItems[p.id]
            const itemEnCarrito = cart?.find((item) => item.id === p.id)
            const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.quantity : 0
            const maximoAlcanzado = cantidadEnCarrito >= p.stock
            const precioPublico = p.precio_minorista ?? p.precio

            return (
              <article key={p.id} className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-border bg-white transition-all hover:border-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                
                <div className="relative aspect-square overflow-hidden bg-muted flex items-center justify-center p-6">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={`Imagen de ${p.nombre}`} className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                      <Smartphone className="size-16 stroke-[1]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Sin Imagen</span>
                    </div>
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-foreground shadow-sm backdrop-blur">
                    {p.categoria}
                  </span>
                  {p.stock < 1 && (
                    <span className="absolute right-4 top-4 rounded-full bg-destructive/10 border border-destructive/20 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-destructive backdrop-blur">
                      Agotado
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground line-clamp-1">{p.nombre}</h3>
                    
                    <div 
                      className="mt-2 text-sm text-muted-foreground line-clamp-2 min-h-[40px] [&>ul]:pl-4 [&>ul]:list-disc prose prose-sm max-w-none text-left leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: p.descripcion || "Equipo testeado y garantizado." }}
                    />

                    <div className="mt-4">
                      {p.stock > 0 ? (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                          {p.stock} Disponibles
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-destructive bg-destructive/5 px-2.5 py-1 rounded-md border border-destructive/10">
                          Sin stock
                        </span>
                      )}
                    </div>
                    
                    <p className="mt-5 text-2xl font-bold tracking-tighter text-foreground">
                      USD {precioPublico.toLocaleString("en-US")}
                    </p>
                    
                    <div className="mt-3">
                      <Link href={`/productos/${p.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/70 transition-colors group/link">
                        Ver detalles 
                        <ArrowUpRight className="size-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      </Link>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleAddToCart(p)} 
                    disabled={isAdded || p.stock < 1 || maximoAlcanzado} 
                    className={cn(
                      "mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold tracking-tight transition-all active:scale-95", 
                      isAdded 
                        ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                        : (p.stock < 1 || maximoAlcanzado) 
                          ? "bg-muted text-muted-foreground pointer-events-none" 
                          : "bg-foreground text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
                    )}
                  >
                    {isAdded ? <><Check className="size-4" /> Agregado</> : p.stock < 1 ? "Agotado" : maximoAlcanzado ? "Límite alcanzado" : <><ShoppingCart className="size-4" /> Comprar</>}
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        {/* MENSAJE SI NO HAY PRODUCTOS */}
        {products.length === 0 && (
          <div className="mt-14 rounded-[2rem] border border-dashed border-border bg-muted/30 py-24 text-center">
            <Smartphone className="mx-auto size-16 text-muted-foreground/30 mb-6" />
            <h3 className="text-xl font-bold tracking-tight text-foreground">El catálogo está vacío</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              Estamos actualizando el inventario. Vuelve a revisar en unos minutos.
            </p>
          </div>
        )}

        {/* 🚀 NUEVO BOTÓN: VER CATÁLOGO COMPLETO */}
        {products.length > 0 && (
          <div className="mt-16 flex justify-center">
            <Link 
              href="/productos" 
              className="group flex items-center gap-2 rounded-full border border-border bg-white px-8 py-4 text-sm font-bold tracking-tight text-foreground hover:border-primary hover:text-primary shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              Ver Catálogo Completo
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

      </div>
    </section>
  )
}