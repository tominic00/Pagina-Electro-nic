"use client"

import React, { useState, useEffect } from "react"
import { Check, Image as ImageIcon } from "lucide-react"
import supabase from "@/lib/supabase"

const pointsOriginales = [
  "Presentación Premium",
  "Procesos claros",
  "Información organizada",
  "Experiencia moderna",
]

export function Experience() {
  const [settings, setSettings] = useState<any>(null)

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

  // Extraemos la lista de casos del JSONB de Supabase
  const casosAntesDespues = Array.isArray(settings?.before_after) ? settings.before_after : []

  return (
    <section
      id="experiencia"
      className="relative overflow-hidden bg-primary py-24 text-primary-foreground lg:py-32"
    >
      <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay">
        <img
          src="/images/laboratorio-pepti-age.jpg" 
          alt="Fondo de laboratorio"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 lg:grid-cols-2 lg:items-center lg:px-10">
        <div>
          <p className="mb-5 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.4em] text-secondary">
            <span className="h-px w-10 bg-secondary" />
            Experiencia PEPTI AGE
          </p>
          <h2 className="font-heading text-4xl font-medium leading-tight tracking-tight text-balance sm:text-5xl">
            Una nueva forma de vivir la investigación
          </h2>
          <p className="mt-6 max-w-lg text-pretty leading-relaxed text-primary-foreground/75">
            Cada detalle está pensado para transmitir confianza, claridad y
            sofisticación, desde la presentación hasta el acompañamiento.
          </p>
        </div>

        {/* 🚀 COMPUERTA INTELIGENTE: Si hay casos clínicos en el panel, dibuja la galería corporal */}
        {casosAntesDespues.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
            {casosAntesDespues.map((caso: any) => (
              <div 
                key={caso.id} 
                className="flex flex-col gap-3 rounded-2xl border border-background/15 bg-background/5 p-4 backdrop-blur-sm text-left"
              >
                <span className="text-xs font-bold tracking-wide text-secondary uppercase truncate">{caso.titulo}</span>
                
                {/* Contenedor de imágenes liofilizadas / cambios biológicos */}
                <div className="grid grid-cols-2 gap-2 h-28 rounded-xl overflow-hidden bg-primary/40 border border-background/10">
                  <div className="relative bg-cover bg-center flex items-end p-2" style={{ backgroundImage: `url(${caso.antes_url})` }}>
                    <span className="bg-primary/80 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">Antes</span>
                  </div>
                  <div className="relative bg-cover bg-center flex items-end p-2" style={{ backgroundImage: `url(${caso.despues_url})` }}>
                    <span className="bg-cyan-rx text-primary text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">Después</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 🚀 SI NO HAY CASOS SUBIDOS, SE MUESTRAN TUS 4 PUNTOS ORIGINALES INTACTOS */
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pointsOriginales.map((p) => (
              <li
                key={p}
                className="flex items-center gap-4 rounded-2xl border border-background/15 bg-background/5 p-5 backdrop-blur-sm"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                  <Check className="size-4" strokeWidth={2.5} />
                </span>
                <span className="text-sm font-medium tracking-wide">{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}