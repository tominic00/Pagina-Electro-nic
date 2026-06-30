"use client"

import React, { useState, useEffect } from "react"
import { ShieldCheck, FlaskConical, Truck, Headset } from "lucide-react"
import supabase from "@/lib/supabase"

const badgesOriginales = [
  { icon: ShieldCheck, title: "Distribuidor Oficial", description: "Respaldo RXWELLHEALTH" },
  { icon: FlaskConical, title: "Pureza Analítica", description: "Calidad certificada" },
  { icon: Truck, title: "Logística Segura", description: "Envíos a todo el país" },
  { icon: Headset, title: "Soporte Profesional", description: "Asesoramiento ágil" },
]

export function TrustBadges() {
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

  // 🎨 CAMPO SEGURO: Empareja tus íconos nativos con los textos dinámicos si existen en la DB
  const badgesFinales = badgesOriginales.map((badge, idx) => {
    const datosBD = settings?.trust_badges?.[idx]
    return {
      icon: badge.icon,
      title: datosBD?.title || badge.title,
      description: datosBD?.description || badge.description,
    }
  })

  return (
    <section className="border-y border-white/10 bg-primary py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {badgesFinales.map((badge, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center gap-4 text-left sm:justify-start lg:justify-center"
            >
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10">
                <badge.icon className="size-6 text-cyan-rx" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-heading text-sm font-semibold tracking-wide text-white uppercase">
                  {badge.title}
                </h3>
                <p className="text-xs text-silver-muted mt-0.5">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}