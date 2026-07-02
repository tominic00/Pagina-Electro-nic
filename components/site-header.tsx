"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation" 
import { Menu, X, ShoppingBag, LogIn, ChevronDown, ShieldCheck, Wrench } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { cn } from "@/lib/utils"
import supabase from "@/lib/supabase"

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
        className="flex items-center gap-2 bg-foreground border border-transparent text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-foreground/90 transition-all shadow-sm active:scale-95"
      >
        <LogIn className="size-3.5" />
        Portal
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left border border-border">
          <a
            href="/portal/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-foreground hover:bg-muted transition-colors"
          >
            <Wrench className="size-4 text-primary" />
            Servicio Técnico
          </a>
          <a
            href="/admin/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-foreground hover:bg-amber-50 text-amber-600 transition-colors border-t border-border mt-1"
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

    const handleScroll = () => setIsScrolled(window.scrollY > 30)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "unset"
    return () => { document.body.style.overflow = "unset" }
  }, [isMobileMenuOpen])

  // 🚀 NUEVA LISTA DE MENÚS SOLICITADOS (Sincronizados con el Footer)
  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Nosotros", href: "/#nosotros" },
    { name: "iPhone (¿Cómo comprar?)", href: "/iPhone", highlight: true },
    { name: "Catálogo", href: "/productos" },
    { name: "Servicio Técnico", href: "/#servicio-tecnico" },
    { name: "Ofertas", href: "/#top" },
    { name: "Soporte", href: "/#faq" },
  ]

  const showSolidBackground = pathname !== "/" || isScrolled || isMobileMenuOpen

  const numeroWA = settings?.footer_whatsapp || "5493812184858"
  const whatsappLink = `https://wa.me/${numeroWA}?text=Hola!%20Quiero%20consultar%20por%20los%20equipos%20de%20Electronic.`

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        showSolidBackground ? "bg-white/90 py-3 shadow-sm backdrop-blur-md border-b border-border" : "bg-transparent py-5 lg:py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10 relative z-[60]">
        
        {/* LOGO */}
        <a href="/" className="relative flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
          <span className="font-bold text-2xl tracking-tighter text-foreground transition-transform hover:scale-105">
            electro·nic
          </span> 
        </a>

        {/* NAVEGACIÓN DESKTOP (Computadoras) */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={cn(
                "text-xs font-bold tracking-tight transition-colors relative py-1",
                link.highlight
                  ? "text-primary flex items-center gap-1 hover:text-primary/80"
                  : showSolidBackground 
                    ? "text-muted-foreground hover:text-foreground" 
                    : "text-foreground/80 hover:text-foreground"
              )}
            >
              {link.highlight && <span className="size-1 rounded-full bg-primary animate-pulse" />}
              {link.name}
            </a>
          ))}
        </nav>

        {/* BOTONES DERECHA DESKTOP */}
        <div className="hidden lg:flex items-center gap-5">
          <button 
            onClick={onOpenCart}
            className="relative flex items-center justify-center p-2 text-foreground hover:text-primary transition-all active:scale-95 animate-in"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="size-[22px]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </button>

          <HeaderLoginButton />

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-muted px-6 py-2.5 text-xs font-bold tracking-tight text-foreground transition-all hover:bg-border active:scale-95"
          >
            Contacto
          </a>
        </div>

        {/* CONTROLES MÓVILES (Celulares) */}
        <div className="flex items-center gap-3 lg:hidden relative z-[60]">
          <button onClick={onOpenCart} className="relative p-2 text-foreground transition-transform active:scale-95" aria-label="Abrir carrito">
            <ShoppingBag className="size-6" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
          
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-foreground transition-transform active:scale-95" aria-label="Toggle menu">
            {isMobileMenuOpen ? <X className="size-7" /> : <Menu className="size-7" />}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      <div
        className={`fixed inset-0 z-40 flex h-screen w-full flex-col items-center justify-center bg-white transition-all duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center gap-6 sm:gap-8 px-6 w-full max-w-[340px] text-center">
          
          <nav className="flex flex-col items-center gap-4 w-full">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "text-xl font-bold tracking-tight transition-colors flex items-center gap-2",
                  link.highlight ? "text-primary" : "text-foreground hover:text-primary"
                )}
              >
                {link.highlight && <span className="size-1.5 rounded-full bg-primary animate-pulse" />}
                {link.name}
              </a>
            ))}
          </nav>
          
          <div className="mt-2 flex w-full flex-col gap-4">
            <div className="w-full bg-muted border border-border rounded-3xl p-2 shadow-sm flex flex-col gap-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block mb-1 mt-1">Portal Operativo</span>
              
              <a 
                href="/portal/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-white transition-all border border-transparent hover:border-border"
              >
                <Wrench className="size-4 text-primary" /> 
                <span>Servicio Técnico</span>
              </a>
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex w-full items-center justify-center rounded-full bg-foreground py-3.5 text-xs font-bold tracking-wider uppercase text-white shadow-md active:scale-95 transition-all hover:bg-primary"
            >
              WhatsApp Directo
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}