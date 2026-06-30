import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { CartProvider } from "@/context/cart-context"
import NextTopLoader from 'nextjs-toploader'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

// 🚀 METADATOS OPTIMIZADOS PARA SEO Y WHATSAPP (OPEN GRAPH)
export const metadata: Metadata = {
  // 1. SEO DURO PARA GOOGLE
  title: "PEPTI AGE | Distribuidor Oficial RXWELLHEALTH Argentina",
  description: "Líderes en distribución de compuestos biotecnológicos y viales liofilizados para investigación. Pureza certificada >99% con respaldo internacional de RXWELLHEALTH en Argentina.",
  keywords: [
    "péptidos argentina",
    "comprar péptidos investigación",
    "péptidos liofilizados argentina",
    "distribuidor rxwellhealth argentina",
    "pepti age",
    "compuestos longevidad celular",
    "biotecnología molecular argentina",
    "viales de investigación analítica",
    "tirzepatide", 
    "cjc-1295", 
    "ghk-cu"
  ],
  
  // 2. CONFIGURACIÓN PARA WHATSAPP Y REDES (Open Graph)
  openGraph: {
    title: "PEPTI AGE | Biotecnología y Wellness Avanzado",
    description: "Conectamos tu investigación con los estándares del primer mundo. Descubrí nuestro catálogo de compuestos importados con >99% de pureza.",
    url: "https://pepti-age.vercel.app",
    siteName: "PEPTI AGE",
    images: [
      {
        url: "/images/laboratorio-pepti-age.jpg", // Usamos la imagen premium de tu Hero para el link de WhatsApp
        width: 1200,
        height: 630,
        alt: "Laboratorio y compuestos de PEPTI AGE",
      },
    ],
    locale: "es_AR",
    type: "website",
  },

  // 3. INDEXACIÓN Y ROBOTS (Para decirle a Google que rastree todo)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // 4. VERIFICACIÓN DE GOOGLE SEARCH CONSOLE (¡Intocable!)
  verification: {
    google: "pjSAjesW2AXu5b1PFJj5vjE1EnZcJpd1zc9Byinuc4A",
  },

}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0a1f5a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`light ${geistSans.variable} ${geistMono.variable} ${playfair.variable} bg-background`}
      style={{ colorScheme: "light" }}
    >
      <head>
        {/* 🚀 GOOGLE ANALYTICS 4 (Rastreo Global) */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-7DT13E6SEH`}
        />
        <Script
          id="google-analytics-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7DT13E6SEH', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        {/* 🚀 BARRITA DE CARGA PREMIUM (Estilo Apple) */}
        <NextTopLoader 
          color="#00e5ff"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #00e5ff, 0 0 5px #00e5ff"
        />
        
        <CartProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </CartProvider>
      </body>
    </html>
  )
}