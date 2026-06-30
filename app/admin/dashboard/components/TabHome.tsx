"use client"

import { useState } from "react"
import { Eye, EyeOff, Save, Loader2, Upload, CheckCircle2, Trash2, X, Smartphone, HelpCircle, Undo, Bold, Link, Gem, FlaskConicalIcon, ShieldCheck, Headset, Star } from "lucide-react"
import supabase from "@/lib/supabase"

// 🚀 IMPORTAMOS TUS VERDADEROS COMPONENTES PREMIUM DEL PROYECTO
import { Hero } from "@/components/hero"
import { TrustBadges } from "@/components/trust-badges"
import { About } from "@/components/about"
import { Standards } from "@/components/standards"
import { Catalog } from "@/components/catalog"
import { Experience } from "@/components/experience"
import { Faq } from "@/components/faq"
import { CtaFooter } from "@/components/cta-footer"

const ExperienceComponent = Experience as any

// 🚀 COMPONENTE INTERNO WYSIWYG TOTALMENTE VISUAL CORREGIDO
function VisualRichEditor({ id, value, placeholder, onChange, minHeight = "40px" }: any) {
  const ejecutarEstiloVisual = (tipo: "cyan" | "secondary" | "bold" | "link" | "normal") => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount || selection.isCollapsed) {
      alert("⚠️ Por favor, primero seleccioná (pintá) la palabra o frase a la que querés darle formato.")
      return
    }

    const range = selection.getRangeAt(0)

    // 🧼 FUNCIÓN DE LIMPIEZA INTERACTIVA: Extrae el texto puro eliminando Spans o Links
    if (tipo === "normal") {
      const textoPlano = selection.toString()
      document.execCommand("insertHTML", false, textoPlano)
    } else if (tipo === "link") {
      const url = prompt("Pegá o escribí la dirección del enlace (ej: https://...):")
      if (!url) return
      const aHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline text-cyan-rx font-bold">${selection.toString()}</a>`
      document.execCommand("insertHTML", false, aHtml)
    } else if (tipo === "bold") {
      const textoSeleccionado = selection.toString()
      document.execCommand("insertHTML", false, `<strong class="font-black text-gray-900">${textoSeleccionado}</strong>`)
    } else if (tipo === "cyan") {
      const textoSeleccionado = selection.toString()
      document.execCommand("insertHTML", false, `<span class="text-cyan-rx font-black">${textoSeleccionado}</span>`)
    } else if (tipo === "secondary") {
      const textoSeleccionado = selection.toString()
      document.execCommand("insertHTML", false, `<span class="text-secondary font-black">${textoSeleccionado}</span>`)
    }

    const cajaEditable = document.getElementById(id)
    if (cajaEditable) {
      onChange(cajaEditable.innerHTML)
    }
  }

  return (
    <div className="space-y-2">
      {/* 🚀 Usamos onMouseDown con preventDefault para que los botones nunca le roben la selección al texto */}
      <div className="flex gap-1 flex-wrap select-none bg-gray-50 p-1.5 rounded-lg border border-gray-200 w-fit">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); ejecutarEstiloVisual("bold") }}
          className="p-2 hover:bg-white rounded-lg border border-gray-200 bg-white shadow-xs transition-all active:scale-95 text-gray-800"
          title="Negrita"
        >
          <Bold className="size-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); ejecutarEstiloVisual("cyan") }}
          className="p-2 hover:bg-white rounded-lg border border-gray-200 bg-white shadow-xs transition-all active:scale-95 text-cyan-rx font-bold"
          title="Pintar Cyan RX"
        >
          Cyan
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); ejecutarEstiloVisual("secondary") }}
          className="p-2 hover:bg-white rounded-lg border border-gray-200 bg-white shadow-xs transition-all active:scale-95 text-amber-500 font-bold"
          title="Pintar Secundario"
        >
          Sec
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); ejecutarEstiloVisual("link") }}
          className="p-2 hover:bg-white rounded-lg border border-gray-200 bg-white shadow-xs transition-all active:scale-95 text-gray-800"
          title="Insertar Enlace"
        >
          <Link className="size-4" />
        </button>
        <div className="h-6 w-px bg-gray-300 mx-1 align-middle self-center"></div>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); ejecutarEstiloVisual("normal") }}
          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg border border-gray-200 bg-white shadow-xs transition-all active:scale-95 text-gray-500 text-xs font-bold"
          title="Quitar Formatos (Limpiar)"
        >
          Limpio
        </button>
      </div>
      <div
        id={id}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        style={{ minHeight }}
        className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-rx bg-gray-50 hover:bg-white transition-colors text-sm text-gray-900 leading-relaxed text-left"
        dangerouslySetInnerHTML={{ __html: value || "" }}
      />
      {placeholder && !value && (
        <p className="text-xs text-gray-400 italic text-left">{placeholder}</p>
      )}
    </div>
  )
}

export function TabHome({ homeSettings, setHomeSettings, isSavingHome, handleSaveHome }: any) {
  
  // Estados de carga multimedia para el Storage
  const [isUploadingHero, setIsUploadingHero] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false) 
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const [isUploadingAntes, setIsUploadingAntes] = useState(false)
  const [isUploadingDespues, setIsUploadingDespues] = useState(false)

  // Control de estados locales de reversión y vista previa
  const [isReverting, setIsReverting] = useState(false)
  const [mostrarPreview, setMostrarPreview] = useState(false)

  // Estados de borradores temporales
  const [nuevoBannerUrl, setNuevoBannerUrl] = useState("")
  const [nuevoCaso, setNuevoCaso] = useState({ titulo: "", antes_url: "", despues_url: "" })
  const [nuevaFaq, setNuevaFaq] = useState({ q: "", a: "" })

  const badgesOriginales = [
    { title: "Distribuidor Oficial", description: "Respaldo RXWELLHEALTH" },
    { title: "Pureza Analítica", description: "Calidad certificada" },
    { title: "Logística Segura", description: "Envíos a todo el país" },
    { title: "Soporte Profesional", description: "Asesoramiento ágil" },
  ]

  const standardsOriginales = [
    { icon: "Gem", title: "Calidad Internacional", text: "Productos seleccionados bajo el estricto control de RXWELLHEALTH, asegurando estándares premium de excelencia." },
    { icon: "FlaskConical", title: "Alta Pureza", text: "Compuestos de alta pureza y óptimo rendimiento, esenciales para el desarrollo de investigaciones analíticas avanzadas." },
    { icon: "ShieldCheck", title: "Trazabilidad Documentada", text: "Transparencia absoluta. Cada compuesto incluye la documentación analítica oficial que respalda la seriedad de tus estudios." },
    { icon: "Headset", title: "Atención Profesional", text: "Un equipo especializado a tu disposición para brindarte un acompañamiento corporativo, ágil y de máxima confianza." },
  ]

  const faqsOriginales = [
    { id: "faq-1", q: "¿Cómo se gestiona la adquisición y distribución?", a: "Para garantizar la máxima confidencialidad y una atención personalizada adaptada a profesionales, clínicas e investigadores, todos los pedidos se coordinan de forma directa. Nuestro equipo te brindará asesoramiento inmediato sobre disponibilidad y cotizaciones específicas." },
    { id: "faq-2", q: "¿Cómo garantizan la estabilidad biológica en los envíos dentro de Argentina?", a: "Despachamos a todo el país bajo un protocolo estricto de empaque térmico premium. Los compuestos viajan protegidos contra impactos mecánicos y variaciones térmicas bruscas, garantizando que el vial liofilizado mantenga su estructura molecular intacta hasta su recepción." },
    { id: "faq-3", q: "¿Qué respalda la calidad de los compuestos liofilizados?", a: "Como distribuidores exclusivos de RXWELLHEALTH, cada lote suministrado cuenta con certificación analítica independiente de pureza superior al 99%. Proveemos trazabilidad de origen y los máximos estándares internacionales exigidos en la biotecnología aplicada." },
    { id: "faq-4", q: "¿Los profesionales de la salud reciben asesoramiento dedicado?", a: "Sí. Contamos con un canal de soporte especializado para médicos integrativos, especialistas en optimización celular e investigadores. Facilitamos documentación técnica, guías de reconstitución molecular y asistencia directa para la correcta evaluación analítica de cada compuesto." },
  ]

  if (!homeSettings) {
    return (
      <div className="flex py-20 items-center justify-center bg-white rounded-2xl border border-gray-100">
        <Loader2 className="size-6 animate-spin text-cyan-rx" />
        <span className="ml-2 text-xs font-bold uppercase tracking-wider text-[#081640]/60">Sincronizando componentes de Pepti-Age...</span>
      </div>
    )
  }

  const handleDeshacerCambios = async () => {
    const confirmar = window.confirm("¿Querés descartar los borradores actuales y volver a la última versión guardada en la web?")
    if (!confirmar) return
    
    setIsReverting(true)
    try {
      const { data, error } = await supabase
        .from("home_settings")
        .select("*")
        .eq("id", "main")
        .single()
      
      if (error) throw error
      if (data) setHomeSettings(data)
    } catch (err) {
      alert("No se pudo recuperar el estado de la base de datos.")
    } finally {
      setIsReverting(false)
    }
  }

  const ejecutarSubidaFoto = async (e: React.ChangeEvent<HTMLInputElement>, destino: "hero" | "hero_cover" | "banner" | "antes" | "despues") => {
    const file = e.target.files?.[0]
    if (!file) return

    if (destino === "hero") setIsUploadingHero(true)
    if (destino === "hero_cover") setIsUploadingCover(true)
    if (destino === "banner") setIsUploadingBanner(true)
    if (destino === "antes") setIsUploadingAntes(true)
    if (destino === "despues") setIsUploadingDespues(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}-home-${destino}.${fileExt}`
      
      const { error: uploadError = null } = await supabase.storage
        .from('productos-viales')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('productos-viales')
        .getPublicUrl(fileName)

      if (destino === "hero") {
        setHomeSettings((prev: any) => ({ ...prev, hero_image_url: publicUrl }))
      } else if (destino === "hero_cover") {
        setHomeSettings((prev: any) => ({ ...prev, hero_cover_url: publicUrl }))
      } else if (destino === "banner") {
        setNuevoBannerUrl(publicUrl)
      } else {
        setNuevoCaso(prev => ({ ...prev, [`${destino}_url`]: publicUrl }))
      }
    } catch (error) {
      alert("Error al subir archivo a Supabase Storage.")
    } finally {
      if (destino === "hero") setIsUploadingHero(false)
      if (destino === "hero_cover") setIsUploadingCover(false)
      if (destino === "banner") setIsUploadingBanner(false)
      if (destino === "antes") setIsUploadingAntes(false)
      if (destino === "despues") setIsUploadingDespues(false)
    }
  }

  const toggleVisibilidad = (campo: string) => {
    setHomeSettings((prev: any) => ({ ...prev, [campo]: !prev[campo] }))
  }

  const actualizarTexto = (campo: string, valor: string) => {
    setHomeSettings((prev: any) => ({ ...prev, [campo]: valor }))
  }

  const badgesActuales = Array.isArray(homeSettings.trust_badges) && homeSettings.trust_badges.length === 4
    ? homeSettings.trust_badges
    : badgesOriginales

  const actualizarBadgeIndividual = (index: number, campo: "title" | "description", valor: string) => {
    const copia = [...badgesActuales]
    copia[index] = { ...copia[index], [campo]: valor }
    setHomeSettings((prev: any) => ({ ...prev, trust_badges: copia }))
  }

  const standardsActuales = Array.isArray(homeSettings.standards_items) && homeSettings.standards_items.length === 4
    ? homeSettings.standards_items
    : standardsOriginales

  const actualizarStandardIndividual = (index: number, campo: "title" | "text" | "icon", valor: string) => {
    const copia = [...standardsActuales]
    copia[index] = { ...copia[index], [campo]: valor }
    setHomeSettings((prev: any) => ({ ...prev, standards_items: copia }))
  }

  const agregarBannerPromo = () => {
    if (!nuevoBannerUrl) return alert("Por favor, selecciona y sube una imagen de promoción primero.")
    const listaActual = Array.isArray(homeSettings.banners) ? homeSettings.banners : []
    setHomeSettings((prev: any) => ({
      ...prev,
      banners: [...listaActual, { url: nuevoBannerUrl, id: Math.random().toString(36).substr(2, 5) }]
    }))
    setNuevoBannerUrl("")
  }

  const eliminarBannerPromo = (id: string) => {
    const listaActual = Array.isArray(homeSettings.banners) ? homeSettings.banners : []
    setHomeSettings((prev: any) => ({
      ...prev,
      banners: listaActual.filter((b: any) => b.id !== id)
    }))
  }

  const agregarCasoClinico = () => {
    if (!nuevoCaso.titulo || !nuevoCaso.antes_url || !nuevoCaso.despues_url) {
      return alert("Por favor, completa el nombre del protocolo y sube ambas imágenes corporales.")
    }
    const listaActual = Array.isArray(homeSettings.before_after) ? homeSettings.before_after : []
    setHomeSettings((prev: any) => ({
      ...prev,
      before_after: [...listaActual, { ...nuevoCaso, id: Math.random().toString(36).substr(2, 5) }]
    }))
    setNuevoCaso({ titulo: "", antes_url: "", despues_url: "" })
  }

  const eliminarCasoClinico = (id: string) => {
    const listaActual = Array.isArray(homeSettings.before_after) ? homeSettings.before_after : []
    setHomeSettings((prev: any) => ({
      ...prev,
      before_after: listaActual.filter((c: any) => c.id !== id)
    }))
  }

  const faqsActuales = Array.isArray(homeSettings.faqs) && homeSettings.faqs.length > 0
    ? homeSettings.faqs
    : faqsOriginales

  const actualizarFaqIndividual = (index: number, campo: "q" | "a", valor: string) => {
    const copia = [...faqsActuales]
    copia[index] = { ...copia[index], [campo]: valor }
    setHomeSettings((prev: any) => ({ ...prev, faqs: copia }))
  }

  const agregarFaqNueva = () => {
    if (!nuevaFaq.q || !nuevaFaq.a) return alert("Por favor, escribe la pregunta y su respuesta.")
    const listaActual = [...faqsActuales]
    setHomeSettings((prev: any) => ({
      ...prev,
      faqs: [...listaActual, { q: nuevaFaq.q, a: nuevaFaq.a, id: Math.random().toString(36).substr(2, 5) }]
    }))
    setNuevaFaq({ q: "", a: "" })
  }

  const eliminarFaq = (index: number) => {
    const copia = faqsActuales.filter((_: any, idx: number) => idx !== index)
    setHomeSettings((prev: any) => ({ ...prev, faqs: copia }))
  }

  return (
    <div className="space-y-8 pb-12 text-left animate-fade-in">
      
      {/* HEADER DE CONTROL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#081640] tracking-tight">Consola de Contenidos: Pepti-Age Home</h2>
          <p className="text-xs text-muted-foreground mt-1">Modificá el diseño, textos y activá/desactivá módulos de la landing principal.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleDeshacerCambios}
            disabled={isReverting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-gray-700 border border-gray-300 font-bold text-xs uppercase tracking-wider px-4 py-3 shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {isReverting ? <Loader2 className="size-3.5 animate-spin" /> : <Undo className="size-4" />}
            Deshacer Cambios
          </button>

          <button
            type="button"
            onClick={() => setMostrarPreview(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#081640] border border-gray-300 font-bold text-xs uppercase tracking-wider px-5 py-3 shadow-sm hover:bg-gray-50 transition-all"
          >
            <Eye className="size-4" />
            👁️ Ver Vista Previa Real
          </button>

          <button
            type="button"
            onClick={handleSaveHome}
            disabled={isSavingHome}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-rx text-[#081640] font-black text-xs uppercase tracking-wider px-5 py-3 shadow-md hover:bg-cyan-600 transition-all disabled:opacity-50"
          >
            {isSavingHome ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Aplicar Cambios en la Web
          </button>
        </div>
      </div>

      {/* BLOQUE 01: BARRA DE AVISOS SUPERIOR */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#081640]/5 rounded-lg text-[#081640] font-bold text-xs">01</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#081640]">Barra de Avisos (Ticker) & Menú Superior</h3>
          </div>
          <button
            type="button"
            onClick={() => toggleVisibilidad("ticker_visible")}
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 ${
              homeSettings.ticker_visible ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {homeSettings.ticker_visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {homeSettings.ticker_visible ? "Visible" : "Oculto"}
          </button>
        </div>
        <VisualRichEditor id="ticker_text" value={homeSettings.ticker_text} placeholder="❄️ Logística de envíos refrigerados normalizada para todo el país" onChange={(v: string) => actualizarTexto("ticker_text", v)} />
      </div>

      {/* BLOQUE 02: HERO / PORTADA PRINCIPAL */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#081640]/5 rounded-lg text-[#081640] font-bold text-xs">02</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#081640]">Sección Portada (Hero)</h3>
          </div>
          <button
            type="button"
            onClick={() => toggleVisibilidad("hero_visible")}
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 ${
              homeSettings.hero_visible ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {homeSettings.hero_visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {homeSettings.hero_visible ? "Visible" : "Oculto"}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-1">
              <label className="text-xs font-bold text-[#081640]/60 uppercase tracking-wider">Título de Impacto (H1)</label>
              <VisualRichEditor id="hero_title" value={homeSettings.hero_title} placeholder="Distribuidores Oficiales en Argentina" onChange={(v: string) => actualizarTexto("hero_title", v)} />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-bold text-[#081640]/60 uppercase tracking-wider">Subtítulo Médico</label>
              <VisualRichEditor id="hero_subtitle" value={homeSettings.hero_subtitle} placeholder="CIENCIA • BIENESTAR • CONFIANZA" minHeight="80px" onChange={(v: string) => actualizarTexto("hero_subtitle", v)} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="grid gap-1">
              <label className="text-[10px] font-bold text-[#081640]/60 uppercase tracking-wider">Imagen de Fondo (Laboratorio)</label>
              <div className="relative rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-between p-3 min-h-[68px]">
                {isUploadingHero ? (
                  <Loader2 className="size-5 animate-spin text-cyan-rx mx-auto" />
                ) : homeSettings.hero_image_url ? (
                  <div className="flex items-center gap-3 w-full">
                    <img src={homeSettings.hero_image_url} alt="Fondo" className="h-10 w-16 object-cover rounded border bg-white shadow-sm" />
                    <span className="text-[10px] font-bold text-green-600">Fondo Personalizado OK</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-2"><Upload className="size-4" /> Original: /images/hero-lab.png</span>
                )}
                <input type="file" accept="image/*" onChange={(e) => ejecutarSubidaFoto(e, "hero")} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid gap-1">
              <label className="text-[10px] font-bold text-cyan-rx uppercase tracking-wider">Foto de Portada (Los 3 Viales al lado del Título)</label>
              <div className="relative rounded-xl border border-dashed border-cyan-rx/30 bg-cyan-rx/5 flex items-center justify-between p-3 min-h-[68px]">
                {isUploadingCover ? (
                  <Loader2 className="size-5 animate-spin text-cyan-rx mx-auto" />
                ) : homeSettings.hero_cover_url ? (
                  <div className="flex items-center gap-3 w-full">
                    <img src={homeSettings.hero_cover_url} alt="Viales" className="h-10 w-16 object-cover rounded border bg-white shadow-sm" />
                    <span className="text-[10px] font-bold text-cyan-rx">Foto de Viales Vinculada</span>
                  </div>
                ) : (
                  <span className="text-xs text-cyan-rx/70 font-bold flex items-center gap-2"><Upload className="size-4" /> Original: /images/three-vials-tirzepatide...</span>
                )}
                <input type="file" accept="image/*" onChange={(e) => ejecutarSubidaFoto(e, "hero_cover")} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 03: TRUST BADGES */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="p-1.5 bg-[#081640]/5 rounded-lg text-[#081640]/50 font-bold text-xs">03</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#081640]">Insignias de Confianza (Trust Badges)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badgesActuales.map((badge: any, index: number) => (
            <div key={index} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
              <span className="text-[10px] font-black text-cyan-rx uppercase tracking-wider">Fila Insignia {index + 1}</span>
              <input type="text" value={badge.title || ""} onChange={(e) => actualizarBadgeIndividual(index, "title", e.target.value)} className="w-full rounded-lg border border-gray-200 p-2 text-xs focus:outline-none font-bold" placeholder={badgesOriginales[index].title} />
              <input type="text" value={badge.description || ""} onChange={(e) => actualizarBadgeIndividual(index, "description", e.target.value)} className="w-full rounded-lg border border-gray-200 p-2 text-[11px] focus:outline-none" placeholder={badgesOriginales[index].description} />
            </div>
          ))}
        </div>
      </div>

      {/* BLOQUE 04: SECCIÓN NOSOTROS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <span className="p-1.5 bg-[#081640]/5 rounded-lg text-[#081640] font-bold text-xs">04</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#081640]">Sección Identidad (Nosotros)</h3>
        </div>
        <div className="space-y-4">
          <div className="grid gap-1">
            <label className="text-xs font-bold text-[#081640]/60 uppercase tracking-wider">Título de Sección (H2)</label>
            <VisualRichEditor id="about_title" value={homeSettings.about_title} placeholder="Líderes en importación de péptidos y biotecnología avanzada" onChange={(v: string) => actualizarTexto("about_title", v)} />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-bold text-[#081640]/60 uppercase tracking-wider">Primer Párrafo Corporativo</label>
            <VisualRichEditor id="about_p1" value={homeSettings.about_p1} placeholder="En PEPTI AGE nacimos con una visión clara: elevar el estándar..." minHeight="68px" onChange={(v: string) => actualizarTexto("about_p1", v)} />
          </div>
          <div className="grid gap-1">
            <label className="text-xs font-bold text-[#081640]/60 uppercase tracking-wider">Segundo Párrafo (Alianza RXWELLHEALTH)</label>
            <VisualRichEditor id="about_p2" value={homeSettings.about_p2} placeholder="A través de nuestra alianza estratégica como Distribuidores Oficiales..." minHeight="68px" onChange={(v: string) => actualizarTexto("about_p2", v)} />
          </div>
        </div>
      </div>

      {/* BLOQUE 05: CARRUSEL DE PROMOCIONES CENTRADO */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#081640]/5 rounded-lg text-[#081640] font-bold text-xs">05</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#081640]">Carrusel de Promociones (Centrado)</h3>
          </div>
          <button type="button" onClick={() => toggleVisibilidad("banners_visible")} className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 ${homeSettings.banners_visible ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{homeSettings.banners_visible ? "Visible" : "Oculto"}</button>
        </div>

        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative bg-white rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-center h-[50px] px-6 cursor-pointer hover:bg-gray-100 w-full sm:w-auto">
            {isUploadingBanner ? <Loader2 className="size-4 animate-spin text-cyan-rx" /> : nuevoBannerUrl ? <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 className="size-4" /> Banner Listo</span> : <span className="text-xs font-bold text-[#081640]/70 flex items-center gap-1.5"><Upload className="size-4" /> Seleccionar Imagen de Promo</span>}
            <input type="file" accept="image/*" onChange={(e) => ejecutarSubidaFoto(e, "banner")} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <button type="button" onClick={agregarBannerPromo} className="bg-cyan-rx text-[#081640] font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-sm w-full sm:w-auto">+ Agregar al Carrusel</button>
        </div>

        <div className="flex gap-3 overflow-x-auto py-2">
          {(Array.isArray(homeSettings.banners) ? homeSettings.banners : []).map((b: any) => (
            <div key={b.id} className="relative h-24 w-40 rounded-xl border border-gray-200 overflow-hidden shrink-0 group shadow-sm bg-gray-100">
              <img src={b.url} alt="Promo" className="h-full w-full object-cover" />
              <button type="button" onClick={() => eliminarBannerPromo(b.id)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="size-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* BLOQUE 06: SECCIÓN ESTÁNDARES DE EXCELENCIA */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#081640]/5 rounded-lg text-[#081640] font-bold text-xs">06</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#081640]">Sección Estándares de Laboratorio</h3>
          </div>
          <button type="button" onClick={() => toggleVisibilidad("standards_visible")} className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 ${homeSettings.standards_visible !== false ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{homeSettings.standards_visible !== false ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}{homeSettings.standards_visible !== false ? "Visible" : "Oculto"}</button>
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-bold text-[#081640]/60 uppercase tracking-wider">Título Principal del Bloque de Excelencia</label>
          <VisualRichEditor id="standards_text" value={homeSettings.standards_text} placeholder="Un compromiso absoluto con la excelencia" onChange={(v: string) => actualizarTexto("standards_text", v)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {standardsActuales.map((item: any, idx: number) => {
            const elIdTitle = `std-title-${idx}`
            const elIdText = `std-text-${idx}`
            return (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-cyan-rx uppercase tracking-wider">Tarjeta {idx + 1}</span>
                  <div className="flex gap-1 bg-white p-1 rounded-lg border shadow-xs">
                    {[
                      { name: "Gem", comp: Gem },
                      { name: "FlaskConical", comp: FlaskConicalIcon },
                      { name: "ShieldCheck", comp: ShieldCheck },
                      { name: "Headset", comp: Headset },
                      { name: "Star", comp: Star }
                    ].map((ic) => (
                      <button key={ic.name} type="button" onClick={() => actualizarStandardIndividual(idx, "icon", ic.name)} className={`p-1 rounded ${item.icon === ic.name || (!item.icon && standardsOriginales[idx].icon === ic.name) ? "bg-[#081640] text-cyan-rx scale-105" : "text-gray-400 hover:bg-gray-100"}`}><ic.comp className="size-3" /></button>
                    ))}
                  </div>
                </div>
                
                <VisualRichEditor id={elIdTitle} value={item.title} placeholder={standardsOriginales[idx].title} onChange={(v: string) => actualizarStandardIndividual(idx, "title", v)} />
                <VisualRichEditor id={elIdText} value={item.text} placeholder={standardsOriginales[idx].text} minHeight="60px" onChange={(v: string) => actualizarStandardIndividual(idx, "text", v)} />
              </div>
            )
          })}
        </div>
      </div>

      {/* BLOQUE 07: EVOLUCIÓN CLÍNICA */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#081640]/5 rounded-lg text-[#081640] font-bold text-xs">07</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#081640]">Resultados Científicos (Antes y Después)</h3>
          </div>
          <button type="button" onClick={() => toggleVisibilidad("before_after_visible")} className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all flex items-center gap-1.5 ${homeSettings.before_after_visible ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>{homeSettings.before_after_visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}{homeSettings.before_after_visible ? "Sección Activa" : "Oculta"}</button>
        </div>
        <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <input type="text" value={nuevoCaso.titulo} onChange={(e) => setNuevoCaso(prev => ({ ...prev, titulo: e.target.value }))} className="bg-white rounded-xl p-3 text-xs border border-gray-200 focus:outline-none h-[46px]" placeholder="Nombre del Protocolo (Ej: Paciente 12 sem)" />
            <div className="relative bg-white rounded-xl border border-gray-200 flex items-center justify-center text-center h-[46px] cursor-pointer">{isUploadingAntes ? <Loader2 className="size-4 animate-spin text-cyan-rx" /> : nuevoCaso.antes_url ? <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Foto Antes OK</span> : <span className="text-xs font-bold text-[#081640]/70 flex items-center gap-1.5"><Upload className="size-4" /> Subir Foto Antes</span>}<input type="file" accept="image/*" onChange={(e) => ejecutarSubidaFoto(e, "antes")} className="absolute inset-0 opacity-0 cursor-pointer" /></div>
            <div className="relative bg-white rounded-xl border border-gray-200 flex items-center justify-center text-center h-[46px] cursor-pointer">{isUploadingDespues ? <Loader2 className="size-4 animate-spin text-cyan-rx" /> : nuevoCaso.despues_url ? <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Foto Después OK</span> : <span className="text-xs font-bold text-[#081640]/70 flex items-center gap-1.5"><Upload className="size-4" /> Subir Foto Después</span>}<input type="file" accept="image/*" onChange={(e) => ejecutarSubidaFoto(e, "despues")} className="absolute inset-0 opacity-0 cursor-pointer" /></div>
          </div>
          <button type="button" onClick={agregarCasoClinico} className="w-full bg-[#081640] text-white rounded-xl text-xs font-black uppercase tracking-wider py-3 transition-all">+ Añadir Caso Médico</button>
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {(Array.isArray(homeSettings.before_after) ? homeSettings.before_after : []).map((caso: any) => (
            <div key={caso.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm"><span className="text-xs font-bold text-[#081640] truncate">{caso.titulo}</span><button type="button" onClick={() => eliminarCasoClinico(caso.id)} className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-all"><Trash2 className="size-3.5" /></button></div>
          ))}
        </div>
      </div>

      {/* BLOQUE 08: PREGUNTAS FRECUENTES */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <span className="p-1.5 bg-[#081640]/5 rounded-lg text-[#081640] font-bold text-xs">08</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#081640]">Preguntas Frecuentes Ajustables (FAQ)</h3>
        </div>
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-3">
          <span className="text-[10px] font-black text-cyan-rx uppercase tracking-wider block">Crear Nueva FAQ</span>
          <input type="text" value={nuevaFaq.q} onChange={(e) => setNuevaFaq(prev => ({ ...prev, q: e.target.value }))} className="w-full rounded-xl bg-white p-3 text-xs border border-gray-200 focus:outline-none" placeholder="Escribí una nueva pregunta frecuente..." />
          <textarea rows={2} value={nuevaFaq.a} onChange={(e) => setNuevaFaq(prev => ({ ...prev, a: e.target.value }))} className="w-full rounded-xl bg-white p-3 text-xs border border-gray-200 focus:outline-none resize-none" placeholder="Escribí la respuesta científica oficial..." />
          <button type="button" onClick={agregarFaqNueva} className="w-full bg-cyan-rx text-[#081640] rounded-xl text-xs font-black uppercase tracking-wider py-2.5 transition-all shadow-sm">+ Añadir al Listado General</button>
        </div>

        <div className="space-y-4 mt-6">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Listado de FAQs en Pantalla (Editables Inline)</span>
          {faqsActuales.map((f: any, idx: number) => {
            const elIdFaqQ = `faq-q-${idx}`
            const elIdFaqA = `faq-a-${idx}`
            return (
              <div key={f.id || idx} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm flex gap-4 items-start justify-between">
                <div className="flex-1 space-y-2">
                  <VisualRichEditor id={elIdFaqQ} value={f.q} placeholder={faqsOriginales[idx]?.q} onChange={(v: string) => actualizarFaqIndividual(idx, "q", v)} />
                  <VisualRichEditor id={elIdFaqA} value={f.a} placeholder={faqsOriginales[idx]?.a} minHeight="60px" onChange={(v: string) => actualizarFaqIndividual(idx, "a", v)} />
                </div>
                <button type="button" onClick={() => eliminarFaq(idx)} className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-xl transition-colors shrink-0 mt-1"><Trash2 className="size-3.5" /></button>
              </div>
            )
          })}
        </div>
      </div>
      {/* 🚀 AGREGAR ESTO ABAJO DE TODO DENTRO DEL BLOQUE 08 DE TU TABHOME.TSX */}
        <div className="mt-6 pt-4 border-t border-gray-100 grid gap-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <label className="text-xs font-bold text-[#081640]/60 uppercase tracking-wider flex items-center gap-1.5">
            🔗 Enlace del Botón del Blog (Debajo de FAQs)
          </label>
          <input 
            type="text" 
            value={homeSettings.faq_blog_url || ""} 
            placeholder="/blog" 
            onChange={(e) => actualizarTexto("faq_blog_url", e.target.value)} 
            className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-cyan-rx focus:outline-none" 
          />
        </div>

      {/* BLOQUE 09: FOOTER CONTACTO */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <span className="p-1.5 bg-[#081640]/5 rounded-lg text-[#081640] font-bold text-xs">09</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#081640]">Footer Institucional & Datos</h3>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <input type="text" value={homeSettings.footer_whatsapp || ""} onChange={(e) => actualizarTexto("footer_whatsapp", e.target.value)} className="rounded-xl border border-gray-200 p-3 text-sm" placeholder="WhatsApp Oficial" />
          <input type="text" value={homeSettings.footer_email || ""} onChange={(e) => actualizarTexto("footer_email", e.target.value)} className="rounded-xl border border-gray-200 p-3 text-sm" placeholder="Email Oficial" />
          <input type="text" value={homeSettings.footer_address || ""} onChange={(e) => actualizarTexto("footer_address", e.target.value)} className="rounded-xl border border-gray-200 p-3 text-sm" placeholder="Dirección del Laboratorio" />
        </div>
      </div>

      {/* 🖥️ VISTA PREVIA ABSOLUTA REAL CON TODOS TUS COMPONENTES CONECTADOS */}
      {mostrarPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#081640]/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-background rounded-3xl w-full max-w-5xl h-[92vh] shadow-2xl border border-border relative flex flex-col overflow-hidden">
            
            {/* Header Flotante del Entorno de Pruebas */}
            <div className="bg-[#081640] p-4 text-white flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-cyan-rx animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-rx">Pre-visualización de Cambios en Caliente (Componentes Reales)</span>
              </div>
              <button 
                type="button" 
                onClick={() => setMostrarPreview(false)} 
                className="bg-white/10 p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* CUERPO DEL CLON REAL */}
            <div className="flex-1 overflow-y-auto space-y-0 text-center bg-background">
              
              {/* Barra de Avisos Real */}
              {homeSettings.ticker_visible && (
                <div 
                  className="bg-cyan-rx text-[#081640] py-2 px-4 text-xs font-bold text-center sticky top-0 z-50"
                  dangerouslySetInnerHTML={{ __html: homeSettings.ticker_text || "❄️ Envíos refrigerados normales" }}
                />
              )}

              {/* 🚀 Pasamos el borrador (homeSettings) a todos los componentes para que rendericen en vivo */}
              {homeSettings.hero_visible !== false && <Hero settingsOverride={homeSettings} />}
              <TrustBadges />
              
              {/* 🚀 CORRECCIÓN EN VISTA PREVIA: Pasamos el estado dinámico a todas las secciones reales */}
              <About settingsOverride={homeSettings} />
              
              {homeSettings.standards_visible !== false && (
                <Standards settingsOverride={homeSettings} />
              )}

              <Catalog />

              {homeSettings.before_after_visible !== false && (
                <ExperienceComponent settingsOverride={homeSettings} />
              )}

              <Faq settingsOverride={homeSettings} />
              <CtaFooter />

            </div>
          </div>
        </div>
      )}

    </div>
  )
}