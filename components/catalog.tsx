"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, ShoppingCart, Check, Loader2, Beaker } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/context/cart-context"
import Link from "next/link"
import supabase from "@/lib/supabase"

type Category =
  | "Metabolismo"
  | "Longevidad"
  | "Recuperación"
  | "Investigación Avanzada"

const filters: ("Todos" | Category)[] = [
  "Todos",
  "Metabolismo",
  "Longevidad",
  "Recuperación",
  "Investigación Avanzada",
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
        .order("created_at", { ascending: false })

      if (!error && data) {
        setProducts(data as Product[])
      }
      setIsLoading(false)
    }

    fetchProductos()
  }, [])

  const visible = active === "Todos" ? products : products.filter((p) => p.categoria === active)

  const handleAddToCart = (product: Product) => {
    const precioPublico = product.precio_minorista ?? product.precio
    
    addToCart({ id: product.id, name: product.nombre, price: precioPublico, stock: product.stock })
    setAddedItems((prev) => ({ ...prev, [product.id]: true }))
    setTimeout(() => { setAddedItems((prev) => ({ ...prev, [product.id]: false })) }, 2000)
  }

  if (isLoading) {
    return (
      <section id="catalogo" className="bg-background py-24 lg:py-32 text-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="size-8 animate-spin text-cyan-rx" />
          <p className="text-sm font-medium tracking-widest uppercase text-silver/60">Sincronizando lote analítico...</p>
        </div>
      </section>
    )
  }

  return (
    <section id="catalogo" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.4em] text-secondary">
              <span className="h-px w-10 bg-secondary" />
              Catálogo
            </p>
            <h2 className="font-heading text-4xl font-medium leading-tight tracking-tight text-primary text-balance sm:text-5xl">
              Péptidos y Compuestos para Investigación
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button key={f} type="button" onClick={() => setActive(f)} className={cn("rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-colors", active === f ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-secondary/60 hover:text-primary")}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => {
            const isAdded = addedItems[p.id]
            const itemEnCarrito = cart?.find((item) => item.id === p.id)
            const cantidadEnCarrito = itemEnCarrito ? itemEnCarrito.quantity : 0
            const maximoAlcanzado = cantidadEnCarrito >= p.stock
            const precioPublico = p.precio_minorista ?? p.precio

            return (
              <article key={p.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-muted/40 transition-all hover:border-secondary/50 hover:shadow-xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted flex items-center justify-center">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={`Vial de péptido ${p.nombre} de grado de investigación en Argentina`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-primary/20"><Beaker className="size-12 stroke-[1.5]" /><span className="text-[10px] font-medium uppercase tracking-wider">Lote en Certificación</span></div>
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[11px] font-medium tracking-wide text-primary backdrop-blur">{p.categoria}</span>
                  {p.stock < 1 && <span className="absolute right-4 top-4 rounded-full bg-destructive/10 border border-destructive/20 px-3 py-1 text-[11px] font-semibold tracking-wide text-destructive backdrop-blur">Agotado</span>}
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="font-heading text-xl font-medium text-primary">{p.nombre}</h3>
                    
                    {/* 🚀 ACÁ ESTÁ LA SOLUCIÓN: Renderizamos HTML seguro y añadimos estilos para las viñetas */}
                    <div 
                      className="mt-1 text-sm text-muted-foreground line-clamp-2 min-h-[40px] [&>ul]:pl-4 [&>ul]:list-disc prose prose-sm max-w-none text-left"
                      dangerouslySetInnerHTML={{ __html: p.descripcion || "Compuesto liofilizado ultra puro para ensayos de laboratorio." }}
                    />

                    <div className="mt-3">
                      {p.stock > 0 ? (
                        <span className="inline-block text-[11px] font-semibold text-emerald-600 bg-emerald-500/5 px-2.5 py-0.5 rounded-full border border-emerald-500/10">{p.stock} unidades disponibles</span>
                      ) : (
                        <span className="inline-block text-[11px] font-semibold text-destructive bg-destructive/5 px-2.5 py-0.5 rounded-full border border-destructive/10">Sin existencias temporales</span>
                      )}
                    </div>
                    
                    <p className="mt-4 text-xl font-bold text-primary">USD {precioPublico.toLocaleString("en-US")}</p>
                    
                    <div className="mt-4"><Link href={`/productos/${p.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:text-primary transition-colors group/link">Ver ficha técnica <ArrowUpRight className="size-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" /></Link></div>
                  </div>
                  <button onClick={() => handleAddToCart(p)} disabled={isAdded || p.stock < 1 || maximoAlcanzado} className={cn("mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-all", isAdded ? "bg-green-500 text-white" : (p.stock < 1 || maximoAlcanzado) ? "bg-border text-muted-foreground pointer-events-none" : "bg-primary text-white hover:bg-cyan-rx hover:text-primary")}>
                    {isAdded ? <><Check className="size-4" /> Agregado</> : p.stock < 1 ? "Agotado" : maximoAlcanzado ? "Límite alcanzado" : <><ShoppingCart className="size-4" /> Añadir al carrito</>}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
        {products.length === 0 && (
          <div className="mt-14 rounded-2xl border border-dashed border-border py-16 text-center">
            <Beaker className="mx-auto size-12 text-primary/20" />
            <h3 className="mt-4 text-sm font-medium text-primary">Catálogo en Sincronización</h3>
            <p className="mt-1 text-xs text-muted-foreground">Los compuestos aparecerán en pantalla apenas el administrador los publique en el panel.</p>
          </div>
        )}
      </div>
    </section>
  )
}