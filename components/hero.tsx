"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { ArrowRight, ShieldCheck, Smartphone, Zap, Wrench } from "lucide-react" // 🚀 Iconos tecnológicos
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
    button1_link: "/#catalogo",
    button2_text: "Servicio Técnico",
    button2_link: "/portal/login",
    features: [
      { text: "Equipos Garantizados", icon: ShieldCheck },
      { text: "Servicio Especializado", icon: Wrench },
      { text: "Accesorios Premium", icon: Zap },
    ]
  }

  // Mapear los iconos si vienen de la BD (Fallback visual para Electronic)
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'microscope': return Smartphone
      case 'award': return ShieldCheck
      case 'shield': return Zap
      default: return Smartphone
    }
  }

  const activeFeatures = settings?.hero_features 
    ? settings.hero_features.map((f: any) => ({ ...f, icon: getIcon(f.icon) }))
    : defaultHero.features

  return (
    <section id="inicio" className="relative min-h-[90vh] lg:min-h-[95vh] w-full flex items-center justify-center overflow-hidden bg-background pt-20">
      
      {/* 🎨 FONDO TECH MINIMALISTA: Blanco con un degradado sutil gris */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-muted/30 to-white" />
        
        {/* Un círculo muy difuminado con el color de tu marca (Violeta) para dar luz sin molestar */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        
        {/* TEXTO PRINCIPAL */}
        <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start pt-10 lg:pt-0">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 mb-8 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex size-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-tight text-foreground uppercase">
              {settings?.hero_badge || "Stock Disponible · Envíos a todo el país"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[5rem] font-bold tracking-tighter text-foreground leading-[1.05] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
            {settings?.hero_title || defaultHero.title}
          </h1>
          
          <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 font-medium tracking-tight">
            {settings?.hero_subtitle || defaultHero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <a
              href={settings?.hero_button1_link || defaultHero.button1_link}
              className="group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-full bg-primary px-8 py-4 text-sm font-bold text-white transition-all hover:bg-primary/90 shadow-md hover:shadow-xl active:scale-95"
            >
              <span className="relative z-10 tracking-tight">{settings?.hero_button1_text || defaultHero.button1_text}</span>
              <ArrowRight className="relative z-10 size-4 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href={settings?.hero_button2_link || defaultHero.button2_link}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-muted border border-border px-8 py-4 text-sm font-bold text-foreground transition-all hover:bg-border active:scale-95 tracking-tight"
            >
              {settings?.hero_button2_text || defaultHero.button2_text}
            </a>
          </div>

          {/* BADGES TECH */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full animate-in fade-in duration-1000 delay-700">
            {activeFeatures.map((feature: any, i: number) => {
              const Icon = feature.icon
              return (
                <div key={i} className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-muted border border-border text-primary shadow-sm">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-xs font-semibold text-foreground tracking-tight">{feature.text}</span>
                </div>
              )
            })}
          </div>

        </div>

        {/* IMAGEN DE LA PORTADA */}
        <div className="flex-1 w-full max-w-xl lg:max-w-none animate-in fade-in zoom-in-95 duration-1000 delay-300 mt-10 lg:mt-0 relative">
          <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl border border-border bg-muted">
            <Image
              src="/images/electronic-hero.jpg" /* ⚠️ ACÁ VAS A PONER UNA FOTO DE IPHONES O TECNOLOGÍA CUANDO LA TENGAS */
              alt="Dispositivos y Accesorios"
              fill
              className="object-cover"
              priority
            />
            {/* Overlay sutil para que no sea una foto plana */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent mix-blend-overlay"></div>
          </div>
        </div>

      </div>
    </section>
  )
}