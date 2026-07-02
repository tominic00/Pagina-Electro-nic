"use client"

import { useState } from "react"
import { ChevronDown, MessageCircle } from "lucide-react"

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  // 🚀 TUS NUEVAS PREGUNTAS TECH
  const faqs = [
    {
      question: "¿Qué garantía tienen los celulares?",
      answer:
        "Todos nuestros equipos cuentan con garantía. Los celulares nuevos tienen la **Garantía Oficial de Apple por 1 año**. Para los equipos usados, ofrecemos **90 días de garantía** propia que cubre fallas de fábrica o funcionamiento que no hayan sido provocadas por mal uso, golpes o contacto con líquidos.",
    },
    {
      question: "¿Qué garantía ofrecen en las reparaciones?",
      answer:
        "Para tu tranquilidad, todas nuestras reparaciones están garantizadas. Brindamos **90 días de cobertura sobre la misma falla** que fue reparada. Además, ofrecemos **30 días de garantía** sobre cualquier otra falla que pudiera surgir a raíz del arreglo. Cabe destacar que la garantía pierde validez si el equipo presenta signos de mala manipulación posterior a la entrega.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos todos los medios de pago para facilitar tu compra o reparación. Podés abonar en efectivo, transferencia bancaria, tarjetas de débito y crédito, o mediante billeteras virtuales como Mercado Pago.",
    },
    {
      question: "¿Son un servicio técnico especializado?",
      answer:
        "Sí, somos un servicio técnico especializado. Contamos con técnicos capacitados y utilizamos repuestos de la más alta calidad para asegurar que tu equipo vuelva a funcionar como nuevo.",
    },
    {
      question: "¿Cuánto demora una reparación?",
      answer:
        "El tiempo de demora depende del tipo de problema. Para fallas en **periféricos** (ej. cambio de batería, módulo o pin de carga), la demora es de **hasta 24 horas**, sujeto a la disponibilidad del repuesto en stock. Para **problemas de placa** o microelectrónica, el proceso es más complejo y puede demorar **hasta 7 días**.",
    },
  ]

  return (
    <section id="faq" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-16">
          <p className="mb-4 inline-flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
            <span className="h-px w-8 bg-primary/60" />
            Información Útil
            <span className="h-px w-8 bg-primary/60" />
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Preguntas Frecuentes
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Todo lo que necesitás saber sobre nuestras garantías, tiempos de reparación y formas de pago.
          </p>
        </div>

        {/* LISTA DE PREGUNTAS */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                openIndex === index 
                  ? "border-primary bg-primary/5 shadow-sm" 
                  : "border-border bg-white hover:border-muted-foreground/30"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className={`text-base font-semibold tracking-tight pr-4 ${openIndex === index ? "text-primary" : "text-foreground"}`}>
                  {faq.question}
                </span>
                <ChevronDown
                  className={`size-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                    openIndex === index ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pb-6 px-6 text-sm text-muted-foreground leading-relaxed">
                    {/* Renderizamos el texto. Reemplazamos los ** por tags <strong> para las negritas */}
                    <span dangerouslySetInnerHTML={{ __html: faq.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER DEL FAQ */}
        <div className="mt-12 flex flex-col items-center justify-center rounded-[2rem] bg-muted/50 p-8 text-center border border-border">
          <MessageCircle className="size-8 text-primary/40 mb-4" />
          <h3 className="text-lg font-bold tracking-tight text-foreground">¿Tenés otra duda?</h3>
          <p className="mt-2 text-sm text-muted-foreground mb-6">
            Escribinos por WhatsApp y nuestro equipo técnico te va a asesorar sin compromiso.
          </p>
          <a
            href="https://wa.me/5493812184858?text=Hola!%20Tengo%20una%20consulta."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold tracking-tight text-white hover:bg-primary/90 transition-all active:scale-95"
          >
            Consultar por WhatsApp
          </a>
        </div>

      </div>
    </section>
  )
}