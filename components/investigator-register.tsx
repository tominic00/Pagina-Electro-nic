"use client"

import { useState } from "react"
import { ClipboardCheck, User, Building, GraduationCap, Mail, MessageSquare } from "lucide-react"
import supabase from "@/lib/supabase"

export function InvestigatorRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    institution: "",
    specialty: "",
    license: "",
    email: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 🔬 1. GUARDADO EN SUPABASE (Esperamos que termine de verdad)
    try {
      const { error } = await supabase
        .from("solicitudes_registro")
        .insert([
          {
            nombre: formData.fullName,
            institucion_o_laboratorio: formData.institution || "Particular",
            whatsapp: "Pendiente validación chat", 
            email: formData.email,
            estado: "Pendiente"
          }
        ])

      if (error) throw error
    } catch (err: any) {
      console.error("Error al registrar solicitud en base de datos:", err.message)
    }

    // 💬 2. AHORA SÍ, DESPACHAMOS A WHATSAPP
    const phone = "5493812184858"

    let message = "*SOLICITUD DE ALTA DE CUENTA - PEPTI AGE*\n"
    message += "-----------------------------------------\n"
    message += `• *Nombre Profesional:* ${formData.fullName}\n`
    message += `• *Institución / Laboratorio:* ${formData.institution}\n`
    message += `• *Especialidad / Área:* ${formData.specialty}\n`
    message += `• *Matrícula / ID Credencial:* ${formData.license || "No especificada"}\n`
    message += `• *Email Institucional:* ${formData.email}\n`
    message += `-----------------------------------------\n`
    message += `Solicito la verificación de mis credenciales para acceder al canal de cotización preferencial de compuestos de investigación.`

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank")
  }

  return (
    <section id="registro-profesional" className="bg-primary/5 border-y border-border py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Columna Izquierda: Información / Beneficios */}
          <div className="lg:col-span-5">
            <p className="mb-5 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.4em] text-secondary">
              <span className="h-px w-10 bg-secondary" />
              Canal B2B Oficial
            </p>
            <h2 className="font-heading text-4xl font-medium leading-tight tracking-tight text-primary sm:text-5xl">
              Programa de Cuentas Institucionales
            </h2>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed">
              Para garantizar el cumplimiento de los estándares internacionales de bioseguridad, PEPTI AGE restringe la cotización masiva de compuestos a profesionales de la salud, investigadores independientes e instituciones validadas.
            </p>
            
            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary font-bold text-xs">✓</span>
                <span>Acceso a documentación de lote extendida (HPLC/Mass Spec completos).</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary font-bold text-xs">✓</span>
                <span>Línea de prioridad logística para el mantenimiento de cadena de frío.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary font-bold text-xs">✓</span>
                <span>Tarifas corporativas por volumen de viales.</span>
              </li>
            </ul>
          </div>

          {/* Columna Derecha: Formulario Premium */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-white p-8 shadow-xl md:p-10">
              <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                <ClipboardCheck className="size-6 text-cyan-rx" />
                <h3 className="font-heading text-xl font-semibold text-primary">Formulario de Validación Técnica</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Nombre y Apellido Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Dr. / Lic. / Mg. Juan Pérez"
                      className="w-full rounded-xl border border-border bg-muted/20 pl-11 pr-4 py-3 text-sm text-primary placeholder:text-muted-foreground/60 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                    />
                  </div>
                </div>

                {/* Institución */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Institución / Laboratorio</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="institution"
                        required
                        value={formData.institution}
                        onChange={handleChange}
                        placeholder="Universidad / Centro Clínico"
                        className="w-full rounded-xl border border-border bg-muted/20 pl-11 pr-4 py-3 text-sm text-primary placeholder:text-muted-foreground/60 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  {/* Especialidad */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Especialidad / Área de Estudio</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="specialty"
                        required
                        value={formData.specialty}
                        onChange={handleChange}
                        placeholder="Endocrinología / Biología celular"
                        className="w-full rounded-xl border border-border bg-muted/20 pl-11 pr-4 py-3 text-sm text-primary placeholder:text-muted-foreground/60 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Matrícula */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Matrícula Profesional / ID (Opcional)</label>
                    <div className="relative">
                      <ClipboardCheck className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="license"
                        value={formData.license}
                        onChange={handleChange}
                        placeholder="MN 123456 / Registro N°"
                        className="w-full rounded-xl border border-border bg-muted/20 pl-11 pr-4 py-3 text-sm text-primary placeholder:text-muted-foreground/60 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Email de Contacto</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 size-4 text-muted-foreground" />
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="contacto@institucion.com"
                        className="w-full rounded-xl border border-border bg-muted/20 pl-11 pr-4 py-3 text-sm text-primary placeholder:text-muted-foreground/60 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* Botón de Envío */}
                <button
                  type="submit"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold tracking-wider text-white uppercase shadow-md hover:bg-cyan-rx hover:text-primary transition-all duration-300 hover:-translate-y-0.5"
                >
                  <MessageSquare className="size-4 fill-current" />
                  Presentar Credenciales por WhatsApp
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}