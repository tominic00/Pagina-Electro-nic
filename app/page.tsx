"use client"

import React, { useState, useEffect, useRef } from "react"
import supabase from "@/lib/supabase"
import { CartDrawer } from "@/components/cart-drawer"
import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Standards } from "@/components/standards"
import { Catalog } from "@/components/catalog"
import { Experience } from "@/components/experience"
import { Faq } from "@/components/faq"
import { CtaFooter } from "@/components/cta-footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { TrustBadges } from "@/components/trust-badges"
import { InvestigatorRegister } from "@/components/investigator-register"
import { PromoCarousel } from "@/components/promo-carousel"
import Head from "next/head" // 🚀 IMPORTAMOS HEAD PARA EL SEO

export default function Page() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const visitaRegistrada = useRef(false)

  // 🎨 ESTADO NUEVO: Guarda la configuración de visibilidad del panel sin alterar tus componentes
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    // 🎨 TRAER CONFIGURACIÓN DE HOME DESDE SUPABASE
    supabase
      .from("home_settings")
      .select("*")
      .eq("id", "main")
      .single()
      .then(({ data }) => {
        if (data) setSettings(data)
      })

    if (!visitaRegistrada.current) {
      visitaRegistrada.current = true
      supabase.from("telemetria_eventos").insert([{ tipo_evento: "visita_landing" }]).then()
    }

    const rastrearClics = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a[href*="wa.me"]')) {
        supabase.from("telemetria_eventos").insert([{ tipo_evento: "click_whatsapp" }]).then()
      }
      const isButtonOrLink = target.closest('button') || target.closest('a');
      if (isButtonOrLink) {
        const text = isButtonOrLink.textContent?.toLowerCase() || "";
        if (text.includes("ficha") || text.includes("técnica") || text.includes("tecnica")) {
          supabase.from("telemetria_eventos").insert([{ tipo_evento: "ver_ficha_tecnica" }]).then()
        }
      }
    }

    document.addEventListener("click", rastrearClics)
    return () => document.removeEventListener("click", rastrearClics)
  }, [])

  // 🤖 CÓDIGO SCHEMA MARKUP CORREGIDO PARA B2B
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "name": "PEPTI-AGE Argentina",
    "alternateName": "RxWellHealth Argentina",
    "url": "https://pepti-age.vercel.app",
    "logo": "https://pepti-age.vercel.app/icon.png",
    "description": "Distribuidores oficiales de compuestos biotecnológicos y péptidos liofilizados de investigación con pureza mayor al 99% en Argentina.",
    "brand": {
      "@type": "Brand",
      "name": "RxWellHealth"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Argentina"
    },
    "knowsAbout": [
      "Tirzepatide",
      "CJC-1295",
      "GHK-Cu",
      "Péptidos Liofilizados",
      "Investigación Biotecnológica",
      "Longevidad Celular"
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      
      {/* 🎨 LA BARRA DE AVISOS SE SIENTA ARRIBA DE TODO, SI ESTÁ ACTIVA */}
      {settings?.ticker_visible && (
        <div className="bg-cyan-rx text-[#081640] py-2 text-center text-xs font-bold sticky top-0 z-50 transition-all">
          {settings.ticker_text || "❄️ Logística de envíos refrigerados normalizada"}
        </div>
      )}

      <main className="bg-background min-h-screen flex flex-col overflow-x-hidden">
        <SiteHeader onOpenCart={() => setIsCartOpen(true)} />
        <div className="flex-1 w-full">
          
          {/* 🎨 INTERRUPTOR PORTADA */}
          {settings?.hero_visible !== false && <Hero />}
          
          <TrustBadges />
          <PromoCarousel />
          <About />
          <Standards />
          <InvestigatorRegister />
          <Catalog />

          {/* 🎨 INTERRUPTOR ANTES Y DESPUÉS */}
          {settings?.before_after_visible !== false && <Experience />}
          
          <Faq />
          <CtaFooter />
        </div>
        <WhatsAppButton />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </main>
    </>
  )
}