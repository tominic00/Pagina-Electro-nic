"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import supabase from "@/lib/supabase"

export function Hero() {
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

  const defaultHero = {
    title: "Tecnología de punta. Al alcance de tu mano.",
    subtitle: "Encontrá los últimos modelos de iPhone, accesorios premium y periféricos gaming con garantía y servicio técnico especializado.",
    button1_text: "Ver Catálogo",
    button1_link: "/productos",
    button2_text: "Servicio Técnico",
    button2_link: "/#servicio-tecnico",
  }

  return (
    <section id="inicio" className="relative min-h-[85vh] lg:min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-background pt-20">
      
      {/* FONDO TECH MINIMALISTA */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-muted/20 to-white" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* TEXTO PRINCIPAL */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start pt-10 lg:pt-0">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex size-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-bold tracking-tight text-foreground uppercase">
              {settings?.hero_badge || "Stock Disponible · Local Comercial en Yerba Buena"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[4.5rem] font-black tracking-tighter text-foreground leading-[1.05] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 uppercase">
            {settings?.hero_title || defaultHero.title}
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 font-semibold tracking-tight">
            {settings?.hero_subtitle || defaultHero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <a
              href={settings?.hero_button1_link || defaultHero.button1_link}
              className="group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-xl bg-foreground px-8 py-4 text-sm font-bold text-white transition-all hover:bg-primary shadow-md hover:shadow-xl active:scale-95"
            >
              <span className="relative z-10 tracking-tight">{settings?.hero_button1_text || defaultHero.button1_text}</span>
              <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href={settings?.hero_button2_link || defaultHero.button2_link}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white border border-border px-8 py-4 text-sm font-bold text-foreground transition-all hover:bg-muted active:scale-95 tracking-tight shadow-sm"
            >
              {settings?.hero_button2_text || defaultHero.button2_text}
            </a>
          </div>
        </div>

        {/* CONTENEDOR DE IMAGEN DE PORTADA */}
        <div className="flex-1 w-full max-w-xl lg:max-w-none animate-in fade-in zoom-in-95 duration-1000 delay-300 mt-10 lg:mt-0 relative">
          <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-border bg-white flex items-center justify-center p-4">
            <Image
              src="/images/electronic-hero.jpg"
              alt="Dispositivos y Accesorios Electronic"
              fill
              className="object-cover transition-transform duration-700 hover:scale-102"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent mix-blend-overlay"></div>
          </div>
        </div>

      </div>
    </section>
  )
}