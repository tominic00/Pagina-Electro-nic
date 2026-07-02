"use client"

import React, { useState, useEffect } from "react"
import { ShieldCheck, Award, Truck, Wrench } from "lucide-react" // 🚀 Íconos Tech
import supabase from "@/lib/supabase"

// 🚀 TUS NUEVAS GARANTÍAS DE CONFIANZA
const badgesOriginales = [
  { icon: Award, title: "25 Años de Trayectoria", description: "Experiencia familiar" },
  { icon: ShieldCheck, title: "Garantía Oficial", description: "Equipos y reparaciones" },
  { icon: Wrench, title: "Servicio Técnico", description: "Taller especializado" },
  { icon: Truck, title: "Envíos y Entregas", description: "A todo el país" },
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

  const badgesFinales = badgesOriginales.map((badge, idx) => {
    const datosBD = settings?.trust_badges?.[idx]
    return {
      icon: badge.icon,
      title: datosBD?.title || badge.title,
      description: datosBD?.description || badge.description,
    }
  })

  return (
    <section className="border-y border-border bg-muted/30 py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {badgesFinales.map((badge, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center gap-4 text-left sm:justify-start lg:justify-center group"
            >
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-border shadow-sm transition-transform group-hover:scale-110 group-hover:border-primary/30">
                <badge.icon className="size-6 text-primary" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground">
                  {badge.title}
                </h3>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
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