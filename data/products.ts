export type Product = {
  id: string
  name: string
  presentation: string
  category: "Metabolismo" | "Longevidad" | "Recuperación" | "Investigación Avanzada"
  image: string
  price: number
  description: string
  researchOverview: string
  applications: string[]
}

export const productsData: Product[] = [
  {
    id: "pep-m1",
    name: "PA · Serie M-1",
    presentation: "Vial 5 mg · Liofilizado",
    category: "Metabolismo",
    image: "/images/vial-1.png",
    price: 85000,
    description: "Compuesto polipeptídico de alta pureza diseñado para el estudio de receptores metabólicos avanzados. Formulado mediante liofilización de precisión para garantizar la máxima estabilidad estructural y una reconstitución uniforme en entornos analíticos rigurosos.",
    researchOverview: "La Serie M-1 actúa en la modulación de las vías de señalización metabólica celular. En ensayos de laboratorio, se evalúa su impacto en la cinética de la homeostasis energética y la regulación de la glucosa in vitro.",
    applications: [
      "Ensayos de afinidad y selectividad de receptores metabólicos.",
      "Estudios sobre mecanismos moleculares del gasto energético celular.",
      "Investigación analítica de estabilidad molecular en solución."
    ]
  },
  {
    id: "pep-l2",
    name: "PA · Serie L-2",
    presentation: "Vial 10 mg · Liofilizado",
    category: "Longevidad",
    image: "/images/vial-2.png",
    price: 125000,
    description: "Análogo peptídico optimizado estructuralmente para incrementar su vida media biológica y estabilidad ante la degradación enzimática. Desarrollado específicamente como estándar de referencia en estudios de biología del envejecimiento.",
    researchOverview: "Este compuesto se utiliza para analizar las cascadas de señalización asociadas con la preservación celular y los biomarcadores de senescencia. Es una herramienta clave en el modelado de la homeostasis tisular.",
    applications: [
      "Modelado de la respuesta celular ante factores de degradación cronológica.",
      "Evaluación de vías de señalización celular dependientes de AMPc.",
      "Investigación analítica de la integridad macromolecular."
    ]
  },
  {
    id: "pep-r3",
    name: "PA · Serie R-3",
    presentation: "Vial 5 mg · Liofilizado",
    category: "Recuperación",
    image: "/images/vial-3.png",
    price: 65000,
    description: "Complejo peptídico formulado para la investigación de los mecanismos de remodelación y reparación biológica. Su síntesis molecular avanzada asegura un perfil de pureza óptimo para ensayos de migración celular.",
    researchOverview: "La Serie R-3 es ampliamente estudiada por su capacidad de interactuar con la matriz extracelular en modelos de laboratorio, permitiendo observar la modulación de factores de crecimiento y la respuesta adaptativa del tejido celular.",
    applications: [
      "Ensayos de proliferación y migración celular en sustratos controlados.",
      "Estudios de interacción molecular con componentes de la matriz extracelular.",
      "Investigación de procesos de modulación inflamatoria a nivel molecular."
    ]
  },
  {
    id: "pep-ia4",
    name: "PA · Serie IA-4",
    presentation: "Vial 15 mg · Liofilizado",
    category: "Investigación Avanzada",
    image: "/images/vial-1.png",
    price: 150000,
    description: "Compuesto de última generación diseñado para proyectos de alta complejidad analítica. Su estructura modificada químicamente expande las posibilidades de mapeo de receptores de baja afinidad.",
    researchOverview: "Este vial representa el estándar más alto en ensayos de cribado de alto rendimiento (High-Throughput Screening). Se enfoca en desentrañar dinámicas de unión complejas y cascadas enzimáticas atípicas.",
    applications: [
      "Mapeo estructural y caracterización biofísica de receptores específicos.",
      "Ensayos cinéticos automatizados de unión a ligandos.",
      "Investigación avanzada de toxicología y estabilidad analítica diferencial."
    ]
  },
  {
    id: "pep-m5",
    name: "PA · Serie M-5",
    presentation: "Vial 2 mg · Liofilizado",
    category: "Metabolismo",
    image: "/images/vial-2.png",
    price: 45000,
    description: "Variante de micro-dosificación analítica orientada a ensayos preliminares de rango de dosis o estudios de curvas de respuesta. Mantiene los rigurosos estándares de liofilización y pureza de las series mayores.",
    researchOverview: "Permite establecer líneas de base en estudios metabólicos moleculares a pequeña escala, optimizando el uso de reactivos auxiliares en el laboratorio de análisis sin sacrificar consistencia de datos.",
    applications: [
      "Establecimiento de curvas dosis-respuesta a escala micromolar.",
      "Estudios piloto de estabilidad analítica competitiva.",
      "Ensayos de screening rápido in vitro."
    ]
  },
  {
    id: "pep-l6",
    name: "PA · Serie L-6",
    presentation: "Vial 10 mg · Liofilizado",
    category: "Longevidad",
    image: "/images/vial-3.png",
    price: 110000,
    description: "Péptido de diseño avanzado enfocado en la investigación de las vías metabólicas de la longevidad y la regulación de la autofagia celular. Desarrollado con técnicas cromatográficas de alta resolución.",
    researchOverview: "La Serie L-6 es evaluada en laboratorio para comprender los mecanismos moleculares detrás de la resistencia celular al estrés oxidativo y la vía de señalización celular reguladora de la biogénesis mitocondrial.",
    applications: [
      "Investigación de biomarcadores moleculares asociados con la longevidad celular.",
      "Estudios de cuantificación analítica del estrés oxidativo mitocondrial.",
      "Análisis de vías enzimáticas relacionadas con la degradación y reciclaje celular."
    ]
  },
]