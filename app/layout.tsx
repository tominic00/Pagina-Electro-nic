import { Analytics } from '@vercel/analytics/react'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import NextTopLoader from 'nextjs-toploader'
import { CartProvider } from "@/context/cart-context"
import './globals.css'

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

// 🚀 DOMINIO BASE DE ELECTRO·NIC
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://electronictuc.vercel.app'

// 🚀 SEO DURO Y OPEN GRAPH PARA ELECTRO·NIC
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Electro·Nic | Celulares, Accesorios y Tecnología",
    template: "%s | Electro·Nic"
  },
  description: "Tu tienda de confianza en Tucumán. Especialistas en iPhones Nuevos y Usados Selección, servicio técnico, accesorios premium y distribución mayorista.",
  keywords: [
    "electronic tucuman",
    "electro nic",
    "comprar iphone tucuman",
    "celulares tucuman",
    "iphones usados seleccionados",
    "iphones nuevos sellados",
    "accesorios celulares tucuman",
    "mayorista celulares argentina",
    "servicio tecnico iphone tucuman",
    "fundas y cargadores iphone",
    "tecnologia yerba buena"
  ],
  
  // 1. CONFIGURACIÓN PARA WHATSAPP Y REDES SOCIALES
  openGraph: {
    title: "Electro·Nic | Todo para tu celular y tecnología",
    description: "Equipos Apple garantizados, accesorios premium y la mejor atención de Tucumán. Mirá nuestro catálogo actualizado.",
    url: siteUrl,
    siteName: "Electro·Nic",
    images: [
      {
        url: "/images/og-electronic.jpg", // Podés poner una foto copada de tu local o de iPhones en public/images/
        width: 1200,
        height: 630,
        alt: "Electro·Nic - Celulares y Tecnología en Tucumán",
      },
    ],
    locale: "es_AR",
    type: "website",
  },

  // 2. TARJETAS PARA TWITTER / TELEGRAM
  twitter: {
    card: "summary_large_image",
    title: "Electro·Nic | Celulares y Tecnología",
    description: "iPhones Nuevos y Usados Selección, accesorios y servicio técnico.",
    images: ["/images/og-electronic.jpg"],
  },

  // 3. INDEXACIÓN EN GOOGLE
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
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#10b981', // Verde Esmeralda insignia de Electro·Nic
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${playfair.variable} bg-background`}
      style={{ colorScheme: "dark" }}
    >
      <head>
        {/* Google Analytics 4 */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-7DT13E6SEH"
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
      <body className="font-sans antialiased bg-black text-white">
        {/* Barrita superior de carga en color verde Electro·Nic */}
        <NextTopLoader 
          color="#10b981"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #10b981, 0 0 5px #10b981"
        />
        
        <CartProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </CartProvider>
      </body>
    </html>
  )
}