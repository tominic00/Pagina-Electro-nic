"use client"

import { useState } from "react"
import { Eye, EyeOff, Save, Loader2, Upload, CheckCircle2, Trash2, X, Smartphone, Undo, Bold, Link, ShieldCheck, Star, Zap, Wrench, LayoutTemplate, MessageSquare, Image as ImageIcon } from "lucide-react"
import supabase from "@/lib/supabase"
import { cn } from "@/lib/utils"

// IMPORTAMOS TUS VERDADEROS COMPONENTES PREMIUM DEL PROYECTO PARA LA VISTA PREVIA
import { Hero } from "@/components/hero"
import { TrustBadges } from "@/components/trust-badges"
import { About } from "@/components/about"
import { Standards } from "@/components/standards"
import { Catalog } from "@/components/catalog"
import { Experience } from "@/components/experience"
import { Faq } from "@/components/faq"
import { CtaFooter } from "@/components/cta-footer"

const HeroComponent = Hero as any
const AboutComponent = About as any
const StandardsComponent = Standards as any
const ExperienceComponent = Experience as any
const FaqComponent = Faq as any

// 🚀 EDITOR DE TEXTO (WYSIWYG) ADAPTADO A MODO OSCURO
function VisualRichEditor({ id, value, placeholder, onChange, minHeight = "40px" }: any) {
  const ejecutarEstiloVisual = (tipo: "cyan" | "secondary" | "bold" | "link" | "normal") => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount || selection.isCollapsed) {
      alert("⚠️ Primero seleccioná (pintá) la palabra o frase a la que querés darle formato.")
      return
    }

    const range = selection.getRangeAt(0)

    if (tipo === "normal") {
      const textoPlano = selection.toString()
      document.execCommand("insertHTML", false, textoPlano)
    } else if (tipo === "link") {
      const url = prompt("Pegá o escribí el enlace (ej: https://...):")
      if (!url) return
      const aHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline text-purple-500 font-bold">${selection.toString()}</a>`
      document.execCommand("insertHTML", false, aHtml)
    } else if (tipo === "bold") {
      const textoSeleccionado = selection.toString()
      document.execCommand("insertHTML", false, `<strong class="font-black text-white">${textoSeleccionado}</strong>`)
    } else if (tipo === "cyan") {
      const textoSeleccionado = selection.toString()
      document.execCommand("insertHTML", false, `<span class="text-purple-500 font-black">${textoSeleccionado}</span>`)
    } else if (tipo === "secondary") {
      const textoSeleccionado = selection.toString()
      document.execCommand("insertHTML", false, `<span class="text-emerald-500 font-black">${textoSeleccionado}</span>`)
    }

    const cajaEditable = document.getElementById(id)
    if (cajaEditable) onChange(cajaEditable.innerHTML)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1 flex-wrap select-none bg-zinc-900 p-1.5 rounded-lg border border-zinc-800 w-fit">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarEstiloVisual("bold") }} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-300 transition-all" title="Negrita"><Bold className="size-4" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarEstiloVisual("cyan") }} className="p-1.5 hover:bg-zinc-800 rounded-md text-purple-400 font-bold text-xs transition-all" title="Color Marca 1">Color 1</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarEstiloVisual("secondary") }} className="p-1.5 hover:bg-zinc-800 rounded-md text-emerald-500 font-bold text-xs transition-all" title="Color Marca 2">Color 2</button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarEstiloVisual("link") }} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-300 transition-all" title="Insertar Enlace"><Link className="size-4" /></button>
        <div className="h-5 w-px bg-zinc-700 mx-1 align-middle self-center"></div>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); ejecutarEstiloVisual("normal") }} className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-md text-zinc-500 text-[10px] font-bold uppercase transition-all" title="Limpiar Formato">Limpiar</button>
      </div>
      <div
        id={id}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        style={{ minHeight }}
        className="p-3 border border-zinc-800 rounded-lg focus:outline-none focus:border-purple-500 bg-zinc-950 text-sm text-zinc-300 leading-relaxed text-left transition-all"
        dangerouslySetInnerHTML={{ __html: value || "" }}
      />
      {placeholder && !value && <p className="text-[10px] text-zinc-600 italic text-left">{placeholder}</p>}
    </div>
  )
}

export function TabHome({ homeSettings, setHomeSettings, isSavingHome, handleSaveHome }: any) {
  
  // Estados de subida
  const [isUploadingHero, setIsUploadingHero] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false) 
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [isUploadingAntes, setIsUploadingAntes] = useState(false)
  const [isUploadingDespues, setIsUploadingDespues] = useState(false)

  // Estados UI
  const [isReverting, setIsReverting] = useState(false)
  const [mostrarPreview, setMostrarPreview] = useState(false)

  const [nuevoBannerUrl, setNuevoBannerUrl] = useState("")
  const [nuevoCaso, setNuevoCaso] = useState({ titulo: "", antes_url: "", despues_url: "" })
  const [nuevaFaq, setNuevaFaq] = useState({ q: "", a: "" })

  // Textos por defecto actualizados para tecnología
  const badgesOriginales = [
    { title: "Servicio Técnico Oficial", description: "Reparaciones con garantía" },
    { title: "Equipos Garantizados", description: "Testeados rigurosamente" },
    { title: "Envíos Seguros", description: "A todo el país" },
    { title: "Atención Personalizada", description: "Asesoramiento 24/7" },
  ]

  const standardsOriginales = [
    { icon: "ShieldCheck", title: "Garantía Escrita", text: "Todos nuestros equipos y reparaciones cuentan con garantía extendida para tu total tranquilidad." },
    { icon: "Wrench", title: "Técnicos Certificados", text: "Contamos con laboratorio propio y especialistas en microelectrónica Apple." },
    { icon: "Zap", title: "Repuestos Originales", text: "Utilizamos únicamente piezas de máxima calidad y repuestos originales para asegurar la vida útil de tu equipo." },
    { icon: "Star", title: "Atención Premium", text: "Te acompañamos desde la compra hasta la post-venta, resolviendo todas tus dudas al instante." },
  ]

  const faqsOriginales = [
    { id: "faq-1", q: "¿Tienen local físico?", a: "Sí, estamos ubicados en Yerba Buena, Tucumán. Podés acercarte a ver los equipos o traer tu dispositivo para diagnóstico." },
    { id: "faq-2", q: "¿Cómo funcionan los envíos?", a: "Hacemos envíos a todo el país. Una vez acreditado el pago, despachamos tu equipo embalado de forma 100% segura y con código de seguimiento." },
  ]

  if (!homeSettings) {
    return (
      <div className="flex py-20 items-center justify-center bg-[#161B22] rounded-2xl border border-zinc-800">
        <Loader2 className="size-6 animate-spin text-purple-500" />
        <span className="ml-3 text-xs font-bold uppercase tracking-wider text-zinc-400">Sincronizando diseño web...</span>
      </div>
    )
  }

  // --- Funciones Lógicas (Se mantienen intactas de tu código base) ---
  const handleDeshacerCambios = async () => {
    if (!window.confirm("¿Descartar borradores y volver a la versión publicada en la web?")) return
    setIsReverting(true)
    try {
      const { data, error } = await supabase.from("home_settings").select("*").eq("id", "main").single()
      if (error) throw error
      if (data) setHomeSettings(data)
    } catch (err) { alert("Error al recuperar estado.") } finally { setIsReverting(false) }
  }

  const ejecutarSubidaFoto = async (e: React.ChangeEvent<HTMLInputElement>, destino: "hero" | "hero_cover" | "banner" | "antes" | "despues") => {
    const file = e.target.files?.[0]; if (!file) return;
    if (destino === "hero") setIsUploadingHero(true); if (destino === "hero_cover") setIsUploadingCover(true);
    if (destino === "banner") setIsUploadingBanner(true); if (destino === "antes") setIsUploadingAntes(true);
    if (destino === "despues") setIsUploadingDespues(true);

    try {
      const fileName = `${Math.random()}-home-${destino}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage.from('productos-viales').upload(fileName, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('productos-viales').getPublicUrl(fileName)

      if (destino === "hero") setHomeSettings((prev: any) => ({ ...prev, hero_image_url: publicUrl }))
      else if (destino === "hero_cover") setHomeSettings((prev: any) => ({ ...prev, hero_cover_url: publicUrl }))
      else if (destino === "banner") setNuevoBannerUrl(publicUrl)
      else setNuevoCaso(prev => ({ ...prev, [`${destino}_url`]: publicUrl }))
    } catch (error) { alert("Error al subir archivo.") } finally {
      if (destino === "hero") setIsUploadingHero(false); if (destino === "hero_cover") setIsUploadingCover(false);
      if (destino === "banner") setIsUploadingBanner(false); if (destino === "antes") setIsUploadingAntes(false);
      if (destino === "despues") setIsUploadingDespues(false);
    }
  }

  const toggleVisibilidad = (campo: string) => setHomeSettings((prev: any) => ({ ...prev, [campo]: !prev[campo] }))
  const actualizarTexto = (campo: string, valor: string) => setHomeSettings((prev: any) => ({ ...prev, [campo]: valor }))

  const badgesActuales = Array.isArray(homeSettings.trust_badges) && homeSettings.trust_badges.length === 4 ? homeSettings.trust_badges : badgesOriginales
  const actualizarBadgeIndividual = (index: number, campo: "title" | "description", valor: string) => {
    const copia = [...badgesActuales]; copia[index] = { ...copia[index], [campo]: valor }; setHomeSettings((prev: any) => ({ ...prev, trust_badges: copia }))
  }

  const standardsActuales = Array.isArray(homeSettings.standards_items) && homeSettings.standards_items.length === 4 ? homeSettings.standards_items : standardsOriginales
  const actualizarStandardIndividual = (index: number, campo: "title" | "text" | "icon", valor: string) => {
    const copia = [...standardsActuales]; copia[index] = { ...copia[index], [campo]: valor }; setHomeSettings((prev: any) => ({ ...prev, standards_items: copia }))
  }

  const agregarBannerPromo = () => {
    if (!nuevoBannerUrl) return alert("Sube una imagen primero."); const listaActual = Array.isArray(homeSettings.banners) ? homeSettings.banners : [];
    setHomeSettings((prev: any) => ({ ...prev, banners: [...listaActual, { url: nuevoBannerUrl, id: Math.random().toString(36).substr(2, 5) }] })); setNuevoBannerUrl("");
  }
  const eliminarBannerPromo = (id: string) => setHomeSettings((prev: any) => ({ ...prev, banners: (Array.isArray(homeSettings.banners) ? homeSettings.banners : []).filter((b: any) => b.id !== id) }))

  const agregarCasoClinico = () => {
    if (!nuevoCaso.titulo || !nuevoCaso.antes_url || !nuevoCaso.despues_url) return alert("Completa el nombre del equipo y sube ambas fotos.");
    const listaActual = Array.isArray(homeSettings.before_after) ? homeSettings.before_after : [];
    setHomeSettings((prev: any) => ({ ...prev, before_after: [...listaActual, { ...nuevoCaso, id: Math.random().toString(36).substr(2, 5) }] })); setNuevoCaso({ titulo: "", antes_url: "", despues_url: "" });
  }
  const eliminarCasoClinico = (id: string) => setHomeSettings((prev: any) => ({ ...prev, before_after: (Array.isArray(homeSettings.before_after) ? homeSettings.before_after : []).filter((c: any) => c.id !== id) }))

  const faqsActuales = Array.isArray(homeSettings.faqs) && homeSettings.faqs.length > 0 ? homeSettings.faqs : faqsOriginales
  const actualizarFaqIndividual = (index: number, campo: "q" | "a", valor: string) => { const copia = [...faqsActuales]; copia[index] = { ...copia[index], [campo]: valor }; setHomeSettings((prev: any) => ({ ...prev, faqs: copia })) }
  const agregarFaqNueva = () => { if (!nuevaFaq.q || !nuevaFaq.a) return; const listaActual = [...faqsActuales]; setHomeSettings((prev: any) => ({ ...prev, faqs: [...listaActual, { ...nuevaFaq, id: Math.random().toString(36).substr(2, 5) }] })); setNuevaFaq({ q: "", a: "" }); }
  const eliminarFaq = (index: number) => setHomeSettings((prev: any) => ({ ...prev, faqs: faqsActuales.filter((_: any, idx: number) => idx !== index) }))

  // Render del componente
  return (
    <div className="space-y-8 pb-12 text-left animate-in fade-in duration-500 w-full max-w-5xl mx-auto">
      
      {/* 🚀 HEADER DE CONTROL FLOTANTE */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[#161B22] p-5 rounded-2xl border border-zinc-800 shadow-sm sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Editor Visual (CMS)</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Personalizá tu tienda pública online</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={handleDeshacerCambios} disabled={isReverting} className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 transition-all">
            {isReverting ? <Loader2 className="size-4 animate-spin" /> : <Undo className="size-4" />} Descartar
          </button>
          <button onClick={() => setMostrarPreview(true)} className="flex items-center gap-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 transition-all">
            <Eye className="size-4" /> Vista Previa
          </button>
          <button onClick={handleSaveHome} disabled={isSavingHome} className="flex items-center gap-2 rounded-xl bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest px-5 py-2.5 shadow-md hover:bg-purple-500 transition-all active:scale-95 disabled:opacity-50">
            {isSavingHome ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Publicar Web
          </button>
        </div>
      </div>

      {/* BLOQUE 1: BARRA DE AVISOS */}
      <div className="bg-[#161B22] rounded-2xl border border-zinc-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400"><MessageSquare className="size-4"/></span>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Barra de Avisos (Top)</h3>
          </div>
          <button onClick={() => toggleVisibilidad("ticker_visible")} className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5", homeSettings.ticker_visible ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
            {homeSettings.ticker_visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />} {homeSettings.ticker_visible ? "Visible" : "Oculto"}
          </button>
        </div>
        <VisualRichEditor id="ticker_text" value={homeSettings.ticker_text} placeholder="Ej: 🔥 3 cuotas sin interés en reparaciones" onChange={(v: string) => actualizarTexto("ticker_text", v)} />
      </div>

      {/* BLOQUE 2: PORTADA HERO */}
      <div className="bg-[#161B22] rounded-2xl border border-zinc-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400"><LayoutTemplate className="size-4"/></span>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Portada Principal (Hero)</h3>
          </div>
          <button onClick={() => toggleVisibilidad("hero_visible")} className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5", homeSettings.hero_visible ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
            {homeSettings.hero_visible ? "Visible" : "Oculto"}
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Título H1</label>
              <VisualRichEditor id="hero_title" value={homeSettings.hero_title} placeholder="Tecnología de punta a tu alcance" onChange={(v: string) => actualizarTexto("hero_title", v)} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Subtítulo</label>
              <VisualRichEditor id="hero_subtitle" value={homeSettings.hero_subtitle} placeholder="Reparación especializada Apple." minHeight="80px" onChange={(v: string) => actualizarTexto("hero_subtitle", v)} />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Foto de Fondo (Fondo general)</label>
              <div className="relative rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 flex items-center justify-between p-3 h-[70px] hover:border-purple-500 transition-colors">
                {isUploadingHero ? <Loader2 className="size-5 animate-spin text-purple-500 mx-auto" /> : homeSettings.hero_image_url ? (
                  <div className="flex items-center gap-3 w-full"><img src={homeSettings.hero_image_url} alt="Fondo" className="h-12 w-20 object-cover rounded-lg border border-zinc-700" /><span className="text-[10px] font-bold text-emerald-500">Fondo Cargado</span></div>
                ) : <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2"><Upload className="size-4" /> Subir Fondo</span>}
                <input type="file" accept="image/*" onChange={(e) => ejecutarSubidaFoto(e, "hero")} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Foto Destacada (Al lado del título)</label>
              <div className="relative rounded-xl border border-dashed border-purple-500/50 bg-purple-500/5 flex items-center justify-between p-3 h-[70px] hover:bg-purple-500/10 transition-colors">
                {isUploadingCover ? <Loader2 className="size-5 animate-spin text-purple-500 mx-auto" /> : homeSettings.hero_cover_url ? (
                  <div className="flex items-center gap-3 w-full"><img src={homeSettings.hero_cover_url} alt="Viales" className="h-12 w-20 object-cover rounded-lg border border-purple-500/20" /><span className="text-[10px] font-bold text-purple-400">Imagen Principal Lista</span></div>
                ) : <span className="text-[10px] text-purple-400/70 font-bold uppercase tracking-widest flex items-center gap-2"><Upload className="size-4" /> Subir Foto Principal</span>}
                <input type="file" accept="image/*" onChange={(e) => ejecutarSubidaFoto(e, "hero_cover")} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: INSIGNIAS */}
      <div className="bg-[#161B22] rounded-2xl border border-zinc-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3">
          <span className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400"><ShieldCheck className="size-4"/></span>
          <h3 className="text-xs font-black uppercase tracking-widest text-white">Insignias / Promesas (Badges)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badgesActuales.map((badge: any, index: number) => (
            <div key={index} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
              <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Insignia {index + 1}</span>
              <input type="text" value={badge.title || ""} onChange={(e) => actualizarBadgeIndividual(index, "title", e.target.value)} className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2.5 text-xs text-white focus:border-purple-500 outline-none font-bold" placeholder={badgesOriginales[index].title} />
              <input type="text" value={badge.description || ""} onChange={(e) => actualizarBadgeIndividual(index, "description", e.target.value)} className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2.5 text-[10px] text-zinc-400 focus:border-purple-500 outline-none" placeholder={badgesOriginales[index].description} />
            </div>
          ))}
        </div>
      </div>

      {/* BLOQUE 4: CARRUSEL BANNERS */}
      <div className="bg-[#161B22] rounded-2xl border border-zinc-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400"><ImageIcon className="size-4"/></span>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Carrusel de Promociones</h3>
          </div>
          <button type="button" onClick={() => toggleVisibilidad("banners_visible")} className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5", homeSettings.banners_visible ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>{homeSettings.banners_visible ? "Visible" : "Oculto"}</button>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative bg-zinc-900 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-center h-[45px] px-6 cursor-pointer hover:border-purple-500 transition-colors w-full sm:w-auto">
            {isUploadingBanner ? <Loader2 className="size-4 animate-spin text-purple-500" /> : nuevoBannerUrl ? <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1"><CheckCircle2 className="size-4" /> Cargado</span> : <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5"><Upload className="size-4" /> Elegir Imagen</span>}
            <input type="file" accept="image/*" onChange={(e) => ejecutarSubidaFoto(e, "banner")} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <button type="button" onClick={agregarBannerPromo} className="bg-zinc-800 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-zinc-700 transition-all w-full sm:w-auto">+ Agregar Banner</button>
        </div>

        <div className="flex gap-3 overflow-x-auto py-2 hide-scrollbar">
          {(Array.isArray(homeSettings.banners) ? homeSettings.banners : []).map((b: any) => (
            <div key={b.id} className="relative h-24 w-40 rounded-xl border border-zinc-700 overflow-hidden shrink-0 group shadow-sm bg-zinc-900">
              <img src={b.url} alt="Promo" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <button type="button" onClick={() => eliminarBannerPromo(b.id)} className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* BLOQUE 5: ANTES Y DESPUÉS (REPARACIONES) */}
      <div className="bg-[#161B22] rounded-2xl border border-zinc-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400"><Wrench className="size-4"/></span>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Casos Reales / Trabajos (Antes y Después)</h3>
          </div>
          <button type="button" onClick={() => toggleVisibilidad("before_after_visible")} className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5", homeSettings.before_after_visible ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>{homeSettings.before_after_visible ? "Visible" : "Oculto"}</button>
        </div>
        <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <input type="text" value={nuevoCaso.titulo} onChange={(e) => setNuevoCaso(prev => ({ ...prev, titulo: e.target.value }))} className="bg-zinc-900 rounded-xl p-3 text-xs text-white border border-zinc-800 focus:border-purple-500 outline-none h-[46px]" placeholder="Ej: iPhone 13 Pantalla Rota" />
            <div className="relative bg-zinc-900 rounded-xl border border-dashed border-zinc-700 hover:border-purple-500 flex items-center justify-center text-center h-[46px] cursor-pointer transition-colors">{isUploadingAntes ? <Loader2 className="size-4 animate-spin text-purple-500" /> : nuevoCaso.antes_url ? <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Foto Roto OK</span> : <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5"><Upload className="size-4" /> Foto Roto</span>}<input type="file" accept="image/*" onChange={(e) => ejecutarSubidaFoto(e, "antes")} className="absolute inset-0 opacity-0 cursor-pointer" /></div>
            <div className="relative bg-zinc-900 rounded-xl border border-dashed border-zinc-700 hover:border-purple-500 flex items-center justify-center text-center h-[46px] cursor-pointer transition-colors">{isUploadingDespues ? <Loader2 className="size-4 animate-spin text-purple-500" /> : nuevoCaso.despues_url ? <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Foto Listo OK</span> : <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5"><Upload className="size-4" /> Foto Reparado</span>}<input type="file" accept="image/*" onChange={(e) => ejecutarSubidaFoto(e, "despues")} className="absolute inset-0 opacity-0 cursor-pointer" /></div>
          </div>
          <button type="button" onClick={agregarCasoClinico} className="w-full bg-zinc-800 hover:bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest py-3 transition-all">Sumar Trabajo al Slider</button>
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {(Array.isArray(homeSettings.before_after) ? homeSettings.before_after : []).map((caso: any) => (
            <div key={caso.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-sm"><span className="text-xs font-bold text-zinc-300 truncate">{caso.titulo}</span><button type="button" onClick={() => eliminarCasoClinico(caso.id)} className="text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white p-2 rounded-xl transition-all"><Trash2 className="size-3.5" /></button></div>
          ))}
        </div>
      </div>

      {/* BLOQUE 6: PREGUNTAS FRECUENTES (FAQS) */}
      <div className="bg-[#161B22] rounded-2xl border border-zinc-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3">
          <span className="p-1.5 bg-zinc-800 rounded-lg text-zinc-400"><MessageSquare className="size-4"/></span>
          <h3 className="text-xs font-black uppercase tracking-widest text-white">Preguntas Frecuentes (FAQ)</h3>
        </div>
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
          <span className="text-[10px] font-black text-purple-400 uppercase tracking-wider block">Agregar Pregunta</span>
          <input type="text" value={nuevaFaq.q} onChange={(e) => setNuevaFaq(prev => ({ ...prev, q: e.target.value }))} className="w-full rounded-xl bg-zinc-900 text-white p-3 text-sm border border-zinc-800 focus:border-purple-500 outline-none" placeholder="Ej: ¿Qué incluye el servicio técnico?" />
          <textarea rows={2} value={nuevaFaq.a} onChange={(e) => setNuevaFaq(prev => ({ ...prev, a: e.target.value }))} className="w-full rounded-xl bg-zinc-900 text-zinc-300 p-3 text-sm border border-zinc-800 focus:border-purple-500 outline-none resize-none" placeholder="Respuesta..." />
          <button type="button" onClick={agregarFaqNueva} className="w-full bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest py-3 transition-all hover:bg-purple-600">+ Añadir a la lista</button>
        </div>

        <div className="space-y-4 mt-6">
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block border-b border-zinc-800 pb-2">Listado Visible en la Web</span>
          {faqsActuales.map((f: any, idx: number) => {
            const elIdFaqQ = `faq-q-${idx}`; const elIdFaqA = `faq-a-${idx}`;
            return (
              <div key={f.id || idx} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl shadow-sm flex gap-4 items-start justify-between">
                <div className="flex-1 space-y-3">
                  <VisualRichEditor id={elIdFaqQ} value={f.q} placeholder={faqsOriginales[idx]?.q} onChange={(v: string) => actualizarFaqIndividual(idx, "q", v)} />
                  <VisualRichEditor id={elIdFaqA} value={f.a} placeholder={faqsOriginales[idx]?.a} minHeight="60px" onChange={(v: string) => actualizarFaqIndividual(idx, "a", v)} />
                </div>
                <button type="button" onClick={() => eliminarFaq(idx)} className="text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white p-2 rounded-xl transition-colors shrink-0 mt-1"><Trash2 className="size-4" /></button>
              </div>
            )
          })}
        </div>
      </div>

      {/* 🖥️ VISTA PREVIA ABSOLUTA REAL */}
      {mostrarPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-6xl h-[95vh] shadow-2xl overflow-hidden relative flex flex-col">
            
            <div className="bg-[#161B22] p-4 text-white flex items-center justify-between border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2">
                <Smartphone className="size-5 text-purple-500" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-300">Vista Previa de tu Tienda</span>
              </div>
              <button type="button" onClick={() => setMostrarPreview(false)} className="bg-zinc-800 p-2 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                <X className="size-5" />
              </button>
            </div>

            {/* IFRAME INTERNO CON TUS COMPONENTES (Forzamos fondo claro porque tu web principal es clara) */}
            <div className="flex-1 overflow-y-auto bg-background text-foreground">
              {homeSettings.ticker_visible && (
                <div className="bg-purple-600 text-white py-2 px-4 text-xs font-bold text-center sticky top-0 z-50" dangerouslySetInnerHTML={{ __html: homeSettings.ticker_text || "Avisos importantes acá" }} />
              )}
              {homeSettings.hero_visible !== false && <HeroComponent settingsOverride={homeSettings} />}
              <TrustBadges />
              <AboutComponent settingsOverride={homeSettings} />
              {homeSettings.standards_visible !== false && <StandardsComponent settingsOverride={homeSettings} />}
              <Catalog />
              {homeSettings.before_after_visible !== false && <ExperienceComponent settingsOverride={homeSettings} />}
              <FaqComponent settingsOverride={homeSettings} />
              <CtaFooter />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}