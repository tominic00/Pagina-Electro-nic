"use client"

import { useState, useEffect } from "react"
import { Plus, Send, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import supabase from "@/lib/supabase"

const faqsOriginales = [
  { q: "¿Cómo se gestiona la adquisición y distribución?", a: "Para garantizar la máxima confidencialidad y una atención personalizada adaptada a profesionales, clínicas e investigadores, todos los pedidos se coordinan de forma directa. Nuestro equipo te brindará asesoramiento inmediato sobre disponibilidad y cotizaciones específicas." },
  { q: "¿Cómo garantizan la estabilidad biológica en los envíos dentro de Argentina?", a: "Despachamos a todo el país bajo un protocolo estricto de empaque térmico premium. Los compuestos viajan protegidos contra impactos mecánicos y variaciones térmicas bruscas, garantizando que el vial liofilizado mantenga su estructura molecular intacta hasta su recepción." },
  { q: "¿Qué respalda la calidad de los compuestos liofilizados?", a: "Como distribuidores exclusivos de RXWELLHEALTH, cada lote suministrado cuenta con certificación analítica independiente de pureza superior al 99%. Proveemos trazabilidad de origen y los máximos estándares internacionales exigidos en la biotecnología aplicada." },
  { q: "¿Los profesionales de la salud reciben asesoramiento dedicado?", a: "Sí. Contamos con un canal de soporte especializado para médicos integrativos, especialistas en optimización celular e investigadores. Facilitamos documentación técnica, guías de reconstitución molecular y asistencia directa para la correcta evaluación analítica de cada compuesto." },
]

export function Faq({ settingsOverride }: { settingsOverride?: any }) {
  const [open, setOpen] = useState<number | null>(0)
  const [userQuery, setUserQuery] = useState("")
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

  const handleSubmitDual = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userQuery.trim()) return

    const whatsappNumber = settingsActuales?.footer_whatsapp || "5493812184858" 
    const emailContacto = settingsActuales?.footer_email || "tominic00@gmail.com"

    const mensajeWp = encodeURIComponent(
      `Hola PEPTI AGE, tengo la siguiente consulta técnica/profesional que no encontré en las FAQ:\n\n"${userQuery}"`
    )

    const wpUrl = `https://wa.me/${whatsappNumber}?text=${mensajeWp}`
    window.open(wpUrl, "_blank")

    const mailSubject = encodeURIComponent("Consulta Técnica - PEPTI AGE")
    const mailBody = encodeURIComponent(`Detalle de la consulta realizada:\n\n${userQuery}`)
    window.location.href = `mailto:${emailContacto}?subject=${mailSubject}&body=${mailBody}`

    setUserQuery("")
  }

  const listaFaqs = Array.isArray(settingsActuales?.faqs) && settingsActuales.faqs.length > 0
    ? settingsActuales.faqs
    : faqsOriginales

  // 🚀 CONECTA EL ENLACE DEL BOTÓN DIRECTO AL APARTADO DINÁMICO DE TU CONSOLA
  const urlBlog = settingsActuales?.faq_blog_url || "/blog"

  return (
    <section id="faq" className="bg-muted py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        
        {/* Encabezado */}
        <div className="text-center">
          <p className="mb-5 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.4em] text-secondary">
            <span className="h-px w-10 bg-secondary" />
            Soporte e Información
          </p>
          <h2 className="font-heading text-4xl font-medium leading-tight tracking-tight text-primary text-balance sm:text-5xl">
            Preguntas Frecuentes
          </h2>
        </div>

        {/* Acordeón de FAQs */}
        <div className="mt-14 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          {listaFaqs.map((item: any, i: number) => {
            const isOpen = open === i
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-muted/50"
                  aria-expanded={isOpen}
                >
                  <span 
                    className="font-heading text-lg font-medium text-primary text-left"
                    dangerouslySetInnerHTML={{ __html: item.q }}
                  />
                  <Plus
                    className={cn(
                      "size-5 shrink-0 text-secondary transition-transform duration-300",
                      isOpen && "rotate-45",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p 
                      className="px-6 pb-6 text-pretty leading-relaxed text-muted-foreground text-sm sm:text-base text-left"
                      dangerouslySetInnerHTML={{ __html: item.a }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 🚀 BOTÓN AL BLOG ESTILIZADO (DEBAJO DE LAS FAQ - SIN CAJAS VACÍAS) */}
        <div className="mt-10 flex justify-center">
          <a 
            href={urlBlog} 
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/30 bg-primary/5 px-6 py-3.5 text-sm font-bold tracking-wide text-primary hover:bg-secondary/10 transition-colors shadow-sm active:scale-95"
          >
            <BookOpen className="size-4 text-secondary" />
            Explorar nuestra Biblioteca Científica y Guías
          </a>
        </div>

        {/* Caja de consulta sin resolver */}
        <div className="mt-16 rounded-2xl border border-secondary/20 bg-primary p-8 text-secondary shadow-xl sm:p-10 text-left">
          <h3 className="font-heading text-2xl font-medium tracking-tight text-white sm:text-3xl">
            ¿Tu duda no está en la lista?
          </h3>
          <p className="mt-2 text-sm text-secondary/80 max-w-xl">
            Escribí tu consulta técnica o administrativa a continuación. Al enviarla, se abrirá nuestro canal oficial de soporte en WhatsApp y se generará una copia de respaldo por correo electrónico.
          </p>

          <form onSubmit={handleSubmitDual} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              required
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Ej: Necesito el CoA detallado del Tirzepatide..."
              className="w-full flex-1 rounded-xl border border-secondary/20 bg-primary-foreground/5 px-4 py-3.5 text-white placeholder-secondary/40 focus:border-cyan-rx focus:outline-none focus:ring-1 focus:ring-cyan-rx text-sm"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-rx px-6 py-3.5 text-sm font-semibold tracking-wide text-primary transition-transform hover:-translate-y-0.5 shadow-md shrink-0 active:scale-95"
            >
              <span>Enviar Consulta</span>
              <Send className="size-4" />
            </button>
          </form>
        </div>

      </div>
    </section>
  )
}