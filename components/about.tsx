"use client"

import React, { useState, useEffect } from "react"
import { Globe2, ShieldCheck, Star, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import supabase from "@/lib/supabase"

export function About({ settingsOverride }: { settingsOverride?: any }) {
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

  // Fallbacks exactos con tus textos de fábrica si no hay nada guardado en la DB
  const aboutTitle = settingsActuales?.about_title || "Líderes en importación de péptidos y biotecnología avanzada"
  const aboutP1 = settingsActuales?.about_p1 || "En <strong>PEPTI AGE</strong> nacimos con una visión clara: elevar el estándar de la optimización celular y la investigación científica en Argentina. No somos intermediarios casuales; somos la vía de acceso directa a compuestos liofilizados y péptidos importados de forma exclusiva desde <strong>Estados Unidos</strong>."
  const aboutP2 = settingsActuales?.about_p2 || "A través de nuestra alianza estratégica como <strong>Distribuidores Oficiales de RXWELLHEALTH en Argentina</strong>, respaldamos a médicos integrativos, clínicas y profesionales de la salud con una infraestructura logística robusta y compuestos de pureza superior al 99%."

  return (
    <section id="nosotros" className="bg-background py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-2 lg:items-center lg:px-10">
        
        <div>
          <p className="mb-5 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.4em] text-secondary">
            <span className="h-px w-10 bg-secondary" />
            Nuestra Identidad
          </p>
          
          {/* 🚀 PROCESA EL FORMATO ENRIQUECIDO DEL H2 */}
          <h2 
            className="font-heading text-4xl font-medium leading-tight tracking-tight text-primary text-balance sm:text-5xl text-left"
            dangerouslySetInnerHTML={{ __html: aboutTitle }}
          />
          
          {/* 🚀 PROCESA EL FORMATO ENRIQUECIDO DE LOS PÁRRAFOS */}
          <p 
            className="mt-8 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg text-left"
            dangerouslySetInnerHTML={{ __html: aboutP1 }}
          />
          <p 
            className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg text-left"
            dangerouslySetInnerHTML={{ __html: aboutP2 }}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[
            { k: "Importación USA", v: "Origen Directo", d: "Logística internacional sin intermediarios, asegurando cadena de frío y estabilidad molecular.", icon: <Globe2 className="size-5 text-secondary" />, highlight: false },
            { k: "Distribución Oficial", v: "Respaldo RXWELLHEALTH", d: "El sello, prestigio y la trazabilidad analítica de un laboratorio líder global en biotecnología.", icon: <ShieldCheck className="size-5 text-white" />, highlight: true },
            { k: "Máxima Pureza", v: "Certificación >99%", d: "Compuestos rigurosamente caracterizados bajo estándares científicos internacionales avanzados.", icon: <Star className="size-5 text-secondary" />, highlight: false },
            { k: "Soporte Clínico", v: "Enfoque Profesional", d: "Asesoramiento dedicado para el desarrollo de protocolos y optimización en centros de salud.", icon: <Users className="size-5 text-secondary" />, highlight: false },
          ].map((item) => (
            <div key={item.v} className={cn("rounded-2xl p-6 transition-all duration-300 relative overflow-hidden border", item.highlight ? "bg-primary border-secondary/30 shadow-xl sm:scale-105 z-10" : "bg-muted/60 border-border hover:border-secondary/50")}>
              <div className="flex items-center justify-between gap-4"><p className={cn("font-heading text-xl font-medium", item.highlight ? "text-secondary" : "text-primary")}>{item.k}</p><div className={cn("rounded-lg p-2", item.highlight ? "bg-secondary/10" : "bg-primary/5")}>{item.icon}</div></div>
              <p className={cn("mt-4 text-sm font-semibold", item.highlight ? "text-white" : "text-primary")}>{item.v}</p>
              <p className={cn("mt-1 text-xs leading-relaxed", item.highlight ? "text-secondary/80" : "text-muted-foreground")}>{item.d}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}