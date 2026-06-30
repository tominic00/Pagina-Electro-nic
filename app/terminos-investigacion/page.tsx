"use client"

import { SiteHeader } from "@/components/site-header"
import { CartDrawer } from "@/components/cart-drawer"
import { useState } from "react"
import { ShieldAlert, Scale, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ResearchTermsPage() {
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <>
      <SiteHeader onOpenCart={() => setIsCartOpen(true)} />
      
      <main className="bg-background min-h-screen pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          
          {/* Botón de regreso */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-10 group"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Volver al inicio
          </Link>

          {/* Encabezado de la página */}
          <div className="border-b border-border pb-8 mb-12">
            <div className="flex items-center gap-3 text-red-500 mb-4">
              <ShieldAlert className="size-8" />
              <span className="text-xs font-bold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">
                Documento Legal Obligatorio
              </span>
            </div>
            <h1 className="font-heading text-3xl font-medium tracking-tight text-primary sm:text-4xl">
              Términos de Uso en Investigación y Exención de Responsabilidad
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Última actualización y validez jurídica: Junio 2026 · República Argentina.
            </p>
          </div>

          {/* Contenido del Marco Legal */}
          <div className="space-y-10 text-base text-muted-foreground leading-relaxed">
            
            <section className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 md:p-8">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-red-500 uppercase tracking-wide mb-3">
                <Scale className="size-5 shrink-0" />
                Declaración Fundamental de Destino
              </h2>
              <p className="text-sm font-medium text-primary">
                Al navegar por este sitio web, consultar el catálogo, solicitar cotizaciones o adquirir los compuestos liofilizados distribuidos por PEPTI AGE, usted (en adelante, &quot;El Usuario&quot;, &quot;El Investigador&quot; o &quot;La Institución&quot;) manifiesta bajo declaración jurada poseer la capacidad legal, técnica y habilitación correspondiente en el territorio de la República Argentina para la manipulación de sustancias químicas de laboratorio.
              </p>
            </section>

            {/* ARTÍCULO 1 */}
            <section>
              <h3 className="font-heading text-xl font-semibold text-primary mb-3">
                1. Exclusión Estricta de Uso Humano o Veterinario
              </h3>
              <p>
                Todos los productos enumerados en este sitio web están destinados <strong>única y exclusivamente para fines de investigación científica in vitro, desarrollo analítico o ensayos de laboratorio controlados</strong>. Ninguno de los compuestos liofilizados reactivos suministrados está diseñado, formulado, ni debe ser utilizado bajo ninguna circunstancia para:
              </p>
              <ul className="mt-3 space-y-2 list-disc pl-6 text-sm">
                <li>Administración, inyección o consumo en seres humanos (pacientes, voluntarios o uso propio).</li>
                <li>Uso clínico, diagnóstico médico, aplicaciones terapéuticas asistenciales o medicina veterinaria.</li>
                <li>Aditivo alimentario, cosmético, suplemento dietario o fármaco de venta libre.</li>
              </ul>
            </section>

            {/* ARTÍCULO 2 */}
            <section>
              <h3 className="font-heading text-xl font-semibold text-primary mb-3">
                2. Marco Regulatorio y Cumplimiento Normativo (ANMAT / SEDRONAR)
              </h3>
              <p>
                Los compuestos se distribuyen bajo la categoría de <strong>insumos químicos reactivos para uso exclusivo en investigación</strong>. PEPTI AGE aclara explícitamente que:
              </p>
              <ul className="mt-3 space-y-2 list-disc pl-6 text-sm">
                <li>Estas sustancias, al no estar destinadas a la medicina humana ni a la comercialización farmacéutica de distribución pública, no se encuentran bajo la órbita de registro de especialidades medicinales de la ANMAT para consumo general.</li>
                <li>Las afirmaciones de carácter científico o biofísico asociadas a las series analíticas provienen de literatura internacional indexada y <strong>no han sido evaluadas ni aprobadas</strong> por organismos regulatorios locales o internacionales (como la FDA o ANMAT) para su prescripción médica.</li>
                <li>El adquirente es el único responsable de verificar que las sustancias no infrinjan normativas locales vigentes o requieran registros específicos según la jurisdicción provincial de su laboratorio o centro de estudio.</li>
              </ul>
            </section>

            {/* ARTÍCULO 3 */}
            <section>
              <h3 className="font-heading text-xl font-semibold text-primary mb-3">
                3. Exención Total de Responsabilidad Civil y Penal
              </h3>
              <p>
                PEPTI AGE, sus propietarios, desarrolladores y marcas asociadas quedan <strong>completamente eximidos de toda responsabilidad civil, penal, laboral o administrativa</strong> derivada de cualquier daño, lesión, enfermedad, fatalidad o perjuicio económico que surja de:
              </p>
              <ul className="mt-3 space-y-2 list-disc pl-6 text-sm">
                <li>El uso indebido, negligente, accidental o intencional de los productos en seres humanos o animales.</li>
                <li>La reconstitución defectuosa, almacenamiento inapropiado (pérdida de cadena de frío) o contaminación cruzada en el laboratorio del cliente.</li>
                <li>El desvío de los productos hacia canales de comercialización clandestina, fraccionamiento o reventa no autorizada como medicamentos.</li>
              </ul>
            </section>

            {/* ARTÍCULO 4 */}
            <section>
              <h3 className="font-heading text-xl font-semibold text-primary mb-3">
                4. Obligación de Bioseguridad y Almacenamiento Técnico
              </h3>
              <p>
                El Investigador o Institución asume la total responsabilidad de la custodia y manipulación de los viales desde el momento de la entrega formal. Esto incluye la disposición de equipos de bioseguridad aptos, personal calificado para la manipulación de liofilizados y sistemas de refrigeración idóneos para conservar la integridad molecular del compuesto conforme a sus especificaciones técnicas de laboratorio.
              </p>
            </section>

            {/* ARTÍCULO 5 */}
            <section>
              <h3 className="font-heading text-xl font-semibold text-primary mb-3">
                5. Jurisdicción y Competencia Legal
              </h3>
              <p>
                Para cualquier divergencia, interpretación o controversia jurídica derivada de las solicitudes de cotización o adquisición de insumos, las partes se someten voluntariamente a la jurisdicción de los Tribunales Ordinarios competentes de la República Argentina, renunciando expresamente a cualquier otro fuero o jurisdicción que pudiera corresponderles.
              </p>
            </section>

            {/* Cierre Formal */}
            <div className="border-t border-border pt-8 flex items-center gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <FileText className="size-4 text-cyan-rx" />
              <span>PEPTI AGE · Compuestos Avanzados Certificados</span>
            </div>

          </div>
        </div>
      </main>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}