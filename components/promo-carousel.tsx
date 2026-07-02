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

  // Auto-Play del Carrusel (Cambia cada 5 segundos)
  useEffect(() => {
    const banners = Array.isArray(settings?.banners) ? settings.banners : []
    if (banners.length <= 1 || !settings?.banners_visible) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
    }, 5000) // 5000ms = 5 segundos

    return () => clearInterval(timer)
  }, [settings])

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
    // Sacamos los márgenes laterales (py-8 px-6) para que pegue contra los bordes de la pantalla
    <section className="w-full bg-background print:hidden overflow-hidden">
      
      {/* 🚀 CARRUSEL FULL-WIDTH (Ocupa 100% del ancho) */}
      <div className="relative group w-full h-[400px] sm:h-[500px] lg:h-[600px] bg-muted/30">
        
        {/* Imagen del Banner Actual */}
        {banners.map((banner: any, idx: number) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              currentIndex === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={banner.url}
              alt={`Promoción Electronic ${idx + 1}`}
              className="w-full h-full object-cover object-center"
            />
            {/* Overlay sutil para oscurecer apenas la foto y que destaquen las flechas */}
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
          </div>
        ))}

        {/* Flechas de Navegación (Diseño Apple: Blancas, difuminadas y más grandes) */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="hidden sm:group-hover:flex absolute top-1/2 -translate-y-1/2 left-4 md:left-8 z-20 size-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 hover:scale-110 shadow-lg"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="hidden sm:group-hover:flex absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-20 size-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 hover:scale-110 shadow-lg"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}

        {/* Indicadores de Puntitos (Alineados abajo al centro) */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
            {banners.map((_: any, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Ir a la diapositiva ${idx + 1}`}
                className={`h-2 transition-all duration-300 rounded-full shadow-sm ${
                  currentIndex === idx 
                    ? "w-8 bg-white" 
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
        
      </div>
    </section>
  )
}