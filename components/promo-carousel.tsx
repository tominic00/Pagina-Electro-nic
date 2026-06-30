"use client"

import React, { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import supabase from "@/lib/supabase"

export function PromoCarousel() {
  const [settings, setSettings] = useState<any>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    supabase
      .from("home_settings")
      .select("*")
      .eq("id", "main")
      .single()
      .then(({ data }) => {
        if (data) setSettings(data)
      })
  }, [])

  // 🛡️ COMPUERTA DE SEGURIDAD: Si está oculto en el panel o está vacío, no renderiza nada
  if (!settings?.banners_visible) return null

  const banners = Array.isArray(settings?.banners) ? settings.banners : []
  if (banners.length === 0) return null

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
  }

  return (
    <section className="w-full bg-background py-8 print:hidden">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        
        {/* Contenedor del Slider con proporciones estéticas adaptables */}
        <div className="relative group overflow-hidden rounded-[1.5rem] border border-secondary/20 shadow-xl bg-primary aspect-[21/9] sm:aspect-[16/6]">
          
          {/* Imagen del Banner Actual */}
          <img
            src={banners[currentIndex]?.url}
            alt={`Promoción Pepti-Age`}
            className="w-full h-full object-cover transition-all duration-500 ease-in-out"
          />

          {/* Flechas de Navegación Manual (Aparecen al pasar el mouse por encima) */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevSlide}
                className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 left-4 z-10 size-9 items-center justify-center rounded-full bg-primary/60 text-secondary backdrop-blur-sm transition-colors hover:bg-primary/80"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="hidden group-hover:flex absolute top-1/2 -translate-y-1/2 right-4 z-10 size-9 items-center justify-center rounded-full bg-primary/60 text-secondary backdrop-blur-sm transition-colors hover:bg-primary/80"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          {/* Indicadores de Puntitos (Barra de progreso inferior) */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {banners.map((_: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 transition-all rounded-full ${
                    currentIndex === idx ? "w-6 bg-cyan-rx" : "w-1.5 bg-secondary/40"
                      }`}
                />
              ))}
            </div>
          )}
          
        </div>
      </div>
    </section>
  )
}