"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import supabase from "@/lib/supabase"

// 🚀 MODIFICACIÓN CLAVE: Le permitimos recibir un borrador temporal opcional (?.)
export function Hero({ settingsOverride }: { settingsOverride?: any }) {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    // Si viene un borrador desde el simulador de administración, frena el fetch para usar los inputs en vivo
    if (settingsOverride) return

    supabase
      .from("home_settings")
      .select("*")
      .eq("id", "main")
      .single()
      .then(({ data }) => {
        if (data) setSettings(data)
      })
  }, [settingsOverride])

  // 🎨 COMPUERTAS DE CONTROL: Si hay vista previa usa el borrador, si no la DB, si no tu hardcode original
  const settingsActuales = settingsOverride || settings

  const fondoLaboratorio = settingsActuales?.hero_image_url || "/images/hero-lab.png"
  const tituloPrincipal = settingsActuales?.hero_title || "Distribuidores Oficiales en Argentina"
  const subtituloPrincipal = settingsActuales?.hero_subtitle || "CIENCIA • BIENESTAR • CONFIANZA"

  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={fondoLaboratorio}
          alt="Laboratorio de biotecnología avanzada y péptidos liofilizados en Argentina"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-transparent to-primary/40" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-32 pb-20 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-7 flex flex-col items-start">
          <p className="mb-6 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.45em] text-secondary">
            <span className="h-px w-10 bg-secondary" />
            Biotecnología y Péptidos Argentina
          </p>

          <div className="relative mb-2 w-full max-w-[350px] py-4 sm:max-w-[450px]">
            <div className="absolute inset-0 z-0 scale-110 rounded-full bg-white/10 blur-[40px]" />
            <Image
              src="/images/logo-2.png"
              alt="Logo RXWELLHEALTH - Fabricante Internacional de Péptidos"
              width={800}
              height={140}
              className="relative z-10 h-auto w-full object-contain filter brightness-0 invert drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]"
              priority
            />
          </div>

          <h1 
            className="mt-2 font-heading text-xl font-medium tracking-wide text-secondary uppercase sm:text-2xl text-left"
            dangerouslySetInnerHTML={{ __html: tituloPrincipal }}
            />
          

          <p 
             className="mt-8 text-lg font-light tracking-[0.3em] text-secondary uppercase text-left"
             dangerouslySetInnerHTML={{ __html: subtituloPrincipal }}
          />

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a href="#catalogo" className="inline-flex items-center justify-center rounded-full bg-cyan-rx px-8 py-3.5 text-sm font-semibold tracking-wide text-primary transition-transform hover:-translate-y-0.5 shadow-md">
              Explorar catálogo
            </a>
            <a href="#nosotros" className="inline-flex items-center justify-center rounded-full border border-secondary/40 px-8 py-3.5 text-sm font-medium tracking-wide text-secondary hover:bg-secondary/10 transition-colors">
              Conocer más
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative mx-auto max-w-[400px]">
            <div className="absolute -inset-6 rounded-[2rem] bg-secondary/10 blur-2xl" />
            <Image
              src="/images/three-vials-tirzepatide-cjc-ghk.png"
              alt="Viales de péptidos Tirzepatide, CJC-1295 y GHK-Cu de grado de investigación en Argentina"
              width={400}
              height={400}
              className="relative w-full h-auto rounded-[1.5rem] border border-secondary/20 shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}