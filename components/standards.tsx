"use client"

import React, { useState, useEffect } from "react"
import { Gem, FlaskConical, ShieldCheck, Headset, Star } from "lucide-react"
import supabase from "@/lib/supabase"

// Diccionario seguro para mapear los strings guardados en Supabase con los vectores Lucide reales
const iconMap: Record<string, any> = {
  Gem,
  FlaskConical,
  ShieldCheck,
  Headset,
  Star
}

const itemsOriginales = [
  { icon: "Gem", title: "Calidad Internacional", text: "Productos seleccionados bajo el estricto control de RXWELLHEALTH, asegurando estándares premium de excelencia." },
  { icon: "FlaskConical", title: "Alta Pureza", text: "Compuestos de alta pureza y óptimo rendimiento, esenciales para el desarrollo de investigaciones analíticas avanzadas." },
  { icon: "ShieldCheck", title: "Trazabilidad Documentada", text: "Transparencia absoluta. Cada compuesto incluye la documentación analítica oficial que respalda la seriedad de tus estudios." },
  { icon: "Headset", title: "Atención Profesional", text: "Un equipo especializado a tu disposición para brindarte un acompañamiento corporativo, ágil y de máxima confianza." },
]

export function Standards({ settingsOverride }: { settingsOverride?: any }) {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
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

  const settingsActuales = settingsOverride || settings

  if (settingsActuales?.standards_visible === false) return null

  const tituloSeccion = settingsActuales?.standards_text || "Un compromiso absoluto con la excelencia"
  const listaTarjetas = Array.isArray(settingsActuales?.standards_items) && settingsActuales.standards_items.length === 4
    ? settingsActuales.standards_items
    : itemsOriginales

  return (
    <section id="estandar" className="bg-muted py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-5 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.4em] text-secondary">
            <span className="h-px w-10 bg-secondary" />
            Nuestro estándar
          </p>
          <h2 
            className="font-heading text-4xl font-medium leading-tight tracking-tight text-primary text-balance sm:text-5xl"
            dangerouslySetInnerHTML={{ __html: tituloSeccion }}
          />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {listaTarjetas.map((item: any, idx: number) => {
            // Resuelve el componente gráfico Lucide de forma dinámica y segura
            const IconComponent = iconMap[item.icon] || iconMap[itemsOriginales[idx].icon] || Gem
            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="flex size-20 items-center justify-center rounded-full border border-secondary/40 bg-background shadow-sm">
                  <div className="flex size-16 items-center justify-center rounded-full bg-secondary/10">
                    <IconComponent className="size-7 text-secondary" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 
                  className="mt-6 font-heading text-xl font-medium text-primary"
                  dangerouslySetInnerHTML={{ __html: item.title || itemsOriginales[idx].title }}
                />
                <p 
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: item.text || itemsOriginales[idx].text }}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}