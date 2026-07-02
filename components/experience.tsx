"use client"

import React, { useState, useEffect } from "react"
import { Star, MessageSquare, User, Send, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import supabase from "@/lib/supabase"

type Review = {
  id?: string
  nombre: string
  comentario: string
  estrellas: number
  created_at?: string
}

export function Experience() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    comentario: "",
    estrellas: 5,
  })

  // 1. Cargar las reseñas desde Supabase al entrar
  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await supabase
        .from("resenas") // ⚠️ Tendrás que crear esta tabla en Supabase
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6) // Mostramos las últimas 6

      if (!error && data) {
        setReviews(data)
      } else {
        // Fallback: Si la tabla no existe aún, mostramos un par de prueba
        setReviews([
          { id: "1", nombre: "Martín R.", comentario: "Llevé mi iPhone a cambiar la batería y en un par de horas ya lo tenía listo. Excelente atención.", estrellas: 5 },
          { id: "2", nombre: "Luciana Gómez", comentario: "Compré unos AirPods y todo de diez. Muy recomendables y el local está buenísimo.", estrellas: 5 },
        ])
      }
    }
    fetchReviews()
  }, [])

  // 2. Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.comentario.trim()) return

    setIsSubmitting(true)

    const nuevaResena = {
      nombre: formData.nombre.trim() || "Cliente Anónimo",
      comentario: formData.comentario.trim(),
      estrellas: formData.estrellas,
    }

    try {
      // Guardamos en Supabase
      const { error } = await supabase.from("resenas").insert([nuevaResena])
      if (!error) {
        // Lo agregamos a la pantalla al instante sin recargar
        setReviews((prev) => [nuevaResena, ...prev].slice(0, 6))
        setHasSubmitted(true)
        setFormData({ nombre: "", comentario: "", estrellas: 5 }) // Limpiar form
      }
    } catch (err) {
      console.error("Error al enviar reseña", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="experiencia" className="relative overflow-hidden bg-muted/30 py-24 lg:py-32 border-y border-border">
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-12 lg:items-start lg:px-10">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-5 lg:sticky lg:top-32">
          <p className="mb-5 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary/60">
            <span className="h-px w-10 bg-primary/60" />
            Experiencia Electronic
          </p>
          <h2 className="text-4xl font-bold leading-tight tracking-tighter text-foreground sm:text-5xl">
            ¿Qué dicen nuestros clientes?
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed mb-8">
            Tu opinión nos ayuda a seguir mejorando. Contanos cómo te fue con tu compra o reparación en nuestro local.
          </p>

          {hasSubmitted ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center animate-in fade-in zoom-in duration-500">
              <CheckCircle2 className="mx-auto size-12 text-emerald-500 mb-4" />
              <h3 className="text-lg font-bold text-foreground">¡Gracias por tu reseña!</h3>
              <p className="text-sm text-muted-foreground mt-2">Tu opinión ya fue publicada. ¡Te esperamos pronto!</p>
              <button 
                onClick={() => setHasSubmitted(false)}
                className="mt-6 text-sm font-semibold text-primary hover:underline"
              >
                Escribir otra reseña
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-border bg-white p-6 shadow-sm sm:p-8">
              {/* Estrellas Interactivas */}
              <div className="mb-6 flex flex-col items-center justify-center gap-2 rounded-xl bg-muted/50 p-4 border border-border">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Calificá tu experiencia</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, estrellas: star })}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={cn(
                          "size-8 transition-colors",
                          star <= formData.estrellas ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {/* Nombre (Opcional) */}
                <div>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Tu nombre (Opcional)"
                      className="w-full rounded-xl border border-border bg-muted/50 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                {/* Comentario */}
                <div>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                    <textarea
                      required
                      rows={3}
                      value={formData.comentario}
                      onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                      placeholder="Contanos tu experiencia..."
                      className="w-full resize-none rounded-xl border border-border bg-muted/50 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.comentario.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-bold tracking-tight text-white shadow-md hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? "Publicando..." : "Publicar reseña"}
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* COLUMNA DERECHA: GRILLA DE RESEÑAS */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {reviews.map((review, idx) => (
              <div 
                key={review.id || idx} 
                className="flex flex-col gap-3 rounded-3xl border border-border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Estrellitas */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-4",
                        i < review.estrellas ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                
                {/* Comentario */}
                <p className="text-sm text-foreground leading-relaxed flex-1 mt-2">
                  "{review.comentario}"
                </p>

                {/* Nombre de usuario */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="size-4" />
                  </div>
                  <span className="text-xs font-bold tracking-tight text-foreground uppercase">
                    {review.nombre}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}