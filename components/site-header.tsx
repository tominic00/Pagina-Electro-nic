"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation" 
import { Menu, X, ShoppingBag, LogIn, ChevronDown, ShieldCheck, User, UserPlus } from "lucide-react"
import { useCart } from "@/context/cart-context"
import supabase from "@/lib/supabase" // 🚀 Conexión interna segura

function HeaderLoginButton() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#081640] border border-cyan-rx/30 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-[#0d225c] hover:border-cyan-rx transition-all shadow-md active:scale-95"
      >
        <LogIn className="size-3.5" />
        Portal
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
          <a
            href="/portal/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-[#081640] hover:bg-cyan-rx/10 transition-colors"
          >
            <UserPlus className="size-4 text-cyan-rx" />
            Portal Cliente B2B
          </a>
          <a
            href="/admin/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-[#081640] hover:bg-amber-50 text-amber-600 transition-colors border-t border-gray-50 mt-1"
          >
            <ShieldCheck className="size-4 text-amber-500" />
            Administración
          </a>
        </div>
      )}
    </div>
  )
}

export function SiteHeader({ onOpenCart }: { onOpenCart?: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname() 
  const { totalItems } = useCart()

  // 🎨 NUEVO STATE: Almacena las configuraciones globales de atención
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

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  const navLinks = [
    { name: "Inicio", href: "/#inicio" },
    { name: "Nosotros", href: "/#nosotros" },
    { name: "Catálogo", href: "/#catalogo" },
    { name: "Blogs", href: "/blog" },
    { name: "Soporte", href: "/#faq" },
  ]

  const showSolidBackground = pathname !== "/" || isScrolled || isMobileMenuOpen

  // 🎨 CONFIGURACIÓN DINÁMICA DE ENLACES DE SOPORTE DIRECTO
  const numeroWA = settings?.footer_whatsapp || "5493812184858"
  const whatsappLink = `https://wa.me/${numeroWA}?text=Hola!%20Quiero%20consultar%20por%20los%20compuestos%20de%20PeptiAge.`

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        showSolidBackground ? "bg-[#081640] py-3 shadow-lg backdrop-blur-md" : "bg-transparent py-5 lg:py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10 relative z-[60]">
        
        {/* LOGO */}
        <a 
          href="/#inicio" 
          className="relative flex items-center"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="relative flex h-14 sm:h-16 w-[240px] sm:w-[280px] transition-transform hover:scale-105">
            <Image
              src="/images/logo-horizontal.png"
              alt="PEPTI AGE - Distribuidor Oficial de Biotecnología y Péptidos en Argentina"
              fill
              className="object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
              priority
            />
          </div>
        </a>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium tracking-wide text-silver/90 hover:text-cyan-rx transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* BOTONES DERECHA DESKTOP */}
        <div className="hidden lg:flex items-center gap-5">
          <button 
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2 text-silver/90 hover:text-cyan-rx transition-colors"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="size-[22px]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 z-10 flex size-5 items-center justify-center rounded-full bg-cyan-rx text-[10px] font-black text-[#081640] shadow-md animate-in zoom-in duration-200">
                {totalItems}
              </span>
            )}
          </button>

          <HeaderLoginButton />

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-cyan-rx px-6 py-2.5 text-xs font-bold tracking-wider text-primary uppercase transition-transform hover:-translate-y-0.5 shadow-md"
          >
            Contacto Directo
          </a>
        </div>

        {/* CONTROLES MÓVILES */}
        <div className="flex items-center gap-3 lg:hidden relative z-[60]">
          <button 
            onClick={onOpenCart}
            className="relative p-2 text-silver"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="size-6" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 z-10 flex size-5 items-center justify-center rounded-full bg-cyan-rx text-[10px] font-black text-[#081640] shadow-md">
                {totalItems}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-silver transition-transform active:scale-95"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="size-7" /> : <Menu className="size-7" />}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      <div
        className={`fixed inset-0 z-40 flex h-screen w-full flex-col items-center justify-center bg-[#081640] transition-all duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen 
            ? "opacity-100 visible" 
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-6 sm:gap-8 px-6 w-full max-w-[320px]">
          
          <nav className="flex flex-col items-center gap-5 sm:gap-6 w-full">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-heading text-xl sm:text-2xl font-medium tracking-wide text-silver hover:text-cyan-rx transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>
          
          <div className="mt-4 flex w-full flex-col gap-5 text-center w-full">
            
            <div className="w-full bg-[#0c215c]/40 border border-cyan-rx/20 rounded-[2rem] p-3 shadow-lg backdrop-blur-md flex flex-col">
              <span className="text-[9px] font-black text-silver/50 uppercase tracking-[0.2em] block mb-2 mt-1">Plataforma B2B</span>
              
              <a 
                href="/portal/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl text-xs font-bold text-white hover:bg-cyan-rx/10 transition-colors"
              >
                <User className="size-4 text-cyan-rx" /> 
                <span className="tracking-wide">Portal Investigadores</span>
              </a>

              <div className="h-px w-3/4 mx-auto bg-white/5 my-1"></div>

              <a 
                href="/admin/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center justify-center gap-3 w-full py-3.5 rounded-xl text-xs font-bold text-white hover:bg-amber-500/10 transition-colors"
              >
                <ShieldCheck className="size-4 text-amber-500" /> 
                <span className="tracking-wide">Administración</span>
              </a>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-2xl sm:rounded-full bg-cyan-rx py-4 sm:py-3.5 text-xs font-black tracking-widest text-[#081640] uppercase shadow-lg active:scale-95 transition-transform mt-2"
            >
              Contacto Directo
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}