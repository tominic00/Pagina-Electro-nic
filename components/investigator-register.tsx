"use client"

import { useState } from "react"
import { ClipboardCheck, User, Smartphone, AlertTriangle, Mail, MessageSquare } from "lucide-react" // 🚀 Íconos tech
import supabase from "@/lib/supabase"

export function InvestigatorRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    model: "",
    issue: "",
    email: "",
    observations: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. GUARDADO EN SUPABASE (Para tu control interno)
    try {
      const { error } = await supabase
        .from("solicitudes_registro") // ⚠️ Podés dejar esta tabla por ahora, o crear una "solicitudes_reparacion" después
        .insert([
          {
            nombre: formData.fullName,
            institucion_o_laboratorio: formData.model, // Guardamos el modelo acá por ahora
            email: formData.email,
            estado: "Pendiente"
          }
        ])

      if (error) throw error
    } catch (err: any) {
      console.error("Error al registrar solicitud en base de datos:", err.message)
    }

    // 2. DESPACHAMOS A WHATSAPP
    const phone = "5493812184858"

    let message = "*NUEVA SOLICITUD DE SERVICIO TÉCNICO*\n"
    message += "-----------------------------------------\n"
    message += `• *Cliente:* ${formData.fullName}\n`
    message += `• *Email:* ${formData.email}\n`
    message += `• *Equipo / Modelo:* ${formData.model}\n`
    message += `• *Falla Reportada:* ${formData.issue}\n`
    message += `• *Observaciones:* ${formData.observations || "Ninguna"}\n`
    message += `-----------------------------------------\n`
    message += `Hola, me gustaría solicitar un presupuesto y turno para revisar este equipo.`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank")
  }

  return (
    <section id="servicio-tecnico" className="bg-muted/30 border-y border-border py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Columna Izquierda: Información / Beneficios */}
          <div className="lg:col-span-5">
            <p className="mb-5 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
              <span className="h-px w-10 bg-primary/60" />
              Soporte Especializado
            </p>
            <h2 className="text-4xl font-bold leading-tight tracking-tighter text-foreground sm:text-5xl">
              Centro de Servicio Técnico
            </h2>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">
              En Electronic no solo vendemos equipos, también los reparamos. Contanos qué le pasó a tu dispositivo y nuestro equipo de técnicos especializados te enviará un diagnóstico preliminar y presupuesto en el día.
            </p>
            
            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3 text-sm font-medium text-foreground">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">✓</span>
                <span>Repuestos originales y de máxima calidad.</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-medium text-foreground">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">✓</span>
                <span>Garantía escrita en todas nuestras reparaciones.</span>
              </li>
              <li className="flex items-start gap-3 text-sm font-medium text-foreground">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">✓</span>
                <span>Atención prioritaria y diagnósticos transparentes.</span>
              </li>
            </ul>
          </div>

          {/* Columna Derecha: Formulario Tech */}
          <div className="lg:col-span-7">
            <div className="rounded-[2rem] border border-border bg-white p-8 shadow-sm md:p-10">
              <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
                <ClipboardCheck className="size-6 text-primary" />
                <h3 className="text-xl font-bold tracking-tight text-foreground">Solicitar Presupuesto</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Nombre */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Nombre y Apellido</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Ej. Juan Pérez"
                        className="w-full rounded-xl border border-border bg-muted/50 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Email de Contacto</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className="w-full rounded-xl border border-border bg-muted/50 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Modelo */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Marca y Modelo del Equipo</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="model"
                        required
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="Ej. iPhone 13 Pro Max"
                        className="w-full rounded-xl border border-border bg-muted/50 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>

                  {/* Falla Principal */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Falla Principal</label>
                    <div className="relative">
                      <AlertTriangle className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="issue"
                        required
                        value={formData.issue}
                        onChange={handleChange}
                        placeholder="Pantalla rota, no carga..."
                        className="w-full rounded-xl border border-border bg-muted/50 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Observaciones (Textarea) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Aclaraciones u Observaciones (Opcional)</label>
                  <textarea
                    name="observations"
                    value={formData.observations}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Contanos más detalles sobre cómo ocurrió el problema o si el equipo ya fue abierto antes..."
                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                  ></textarea>
                </div>

                {/* Botón de Envío */}
                <button
                  type="submit"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-4 text-sm font-bold tracking-tight text-white shadow-md hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                >
                  <MessageSquare className="size-4" />
                  Enviar Consulta por WhatsApp
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}