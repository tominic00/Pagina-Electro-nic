"use client"

import React, { useState, useEffect } from "react"
import { HeartHandshake, Lightbulb, ShieldCheck, Users } from "lucide-react" // 🚀 Íconos de valores
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

  // 🚀 TUS TEXTOS FAMILIARES REALES
  const aboutTitle = settingsActuales?.about_title || "Nuestra Historia: 25 Años de Evolución Familiar"
  const aboutP1 = settingsActuales?.about_p1 || "En <strong>Electronic</strong>, somos más que una tienda de tecnología; somos una familia apasionada por conectar a las personas con el futuro. Todo comenzó en el año 2000, operando con orgullo como Agencia Oficial de CTI Móvil, acercando a los tucumanos las primeras grandes innovaciones en comunicación."
  const aboutP2 = settingsActuales?.about_p2 || "En 2015, dimos un paso fundamental al abrir nuestro local físico en el corazón de Yerba Buena. Hoy, un cuarto de siglo después, seguimos evolucionando con el mismo espíritu humano del primer día: proveer soluciones tecnológicas con calidez, confianza y el respaldo de un negocio atendido por sus propios dueños."

  return (
    <section id="nosotros" className="bg-background py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-2 lg:items-center lg:px-10">
        
        {/* COLUMNA IZQUIERDA: HISTORIA */}
        <div>
          <p className="mb-5 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
            <span className="h-px w-10 bg-primary/60" />
            Nuestra Identidad
          </p>
          
          <h2 
            className="text-4xl font-bold leading-tight tracking-tighter text-foreground text-balance sm:text-5xl text-left"
            dangerouslySetInnerHTML={{ __html: aboutTitle }}
          />
          
          <p 
            className="mt-8 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg text-left"
            dangerouslySetInnerHTML={{ __html: aboutP1 }}
          />
          <p 
            className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg text-left"
            dangerouslySetInnerHTML={{ __html: aboutP2 }}
          />
        </div>

        {/* COLUMNA DERECHA: LOS 4 VALORES */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {[
            { k: "Integridad y Legado", v: "25 Años de Confianza", d: "Actuamos con total honestidad. La confianza de nuestros clientes es nuestro mayor orgullo.", icon: <HeartHandshake className="size-5 text-foreground" />, highlight: false },
            { k: "Innovación Cercana", v: "Vanguardia Tecnológica", d: "Nos mantenemos al día con las últimas tendencias para traducirlas en soluciones sencillas para vos.", icon: <Lightbulb className="size-5 text-white" />, highlight: true },
            { k: "Accesibilidad", v: "Respaldo y Seguridad", d: "Precios competitivos con la seguridad y garantía de un local con trayectoria comercial.", icon: <ShieldCheck className="size-5 text-foreground" />, highlight: false },
            { k: "Pasión por el Cliente", v: "Trato Humano", d: "No solo vendemos equipos; nos involucramos para entender qué necesitás y acompañarte.", icon: <Users className="size-5 text-foreground" />, highlight: false },
          ].map((item) => (
            <div key={item.v} className={cn("rounded-3xl p-6 transition-all duration-300 relative overflow-hidden border", item.highlight ? "bg-primary border-primary shadow-xl sm:scale-105 z-10" : "bg-muted/50 border-border hover:border-muted-foreground/30")}>
              <div className="flex items-center justify-between gap-4">
                <p className={cn("text-lg font-bold tracking-tight", item.highlight ? "text-white" : "text-foreground")}>{item.k}</p>
                <div className={cn("rounded-xl p-2", item.highlight ? "bg-white/20" : "bg-white border border-border")}>
                  {item.icon}
                </div>
              </div>
              <p className={cn("mt-4 text-sm font-semibold uppercase tracking-wider", item.highlight ? "text-white/90" : "text-primary")}>{item.v}</p>
              <p className={cn("mt-2 text-sm leading-relaxed", item.highlight ? "text-white/80" : "text-muted-foreground")}>{item.d}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}