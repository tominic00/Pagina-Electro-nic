import { MetadataRoute } from 'next'
import { productsData } from '@/data/products'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pepti-age.vercel.app'

  // Generamos automáticamente las rutas de los 6 productos de tu catálogo
  const productUrls = productsData.map((product) => ({
    url: `${baseUrl}/productos/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Rutas estáticas principales
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/terminos-investigacion`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ]

  return [...staticUrls, ...productUrls]
}