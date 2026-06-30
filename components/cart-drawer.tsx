"use client"

import { useCart } from "@/context/cart-context"
import { X, Plus, Minus, ShoppingBag, MessageSquare } from "lucide-react"

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart()

  // Función corregida para cotizar en USD y mantener el formato analítico
  const handleCheckout = () => {
    const phone = "5493812184858" 
    
    let message = "🔬 *SOLICITUD DE DESPACHO - PEPTI AGE*\n\n"
    message += "Hola, deseo coordinar los detalles de pago y envío para el siguiente lote de investigación:\n\n"
    
    cart.forEach((item) => {
      const subtotal = item.price * item.quantity
      message += `▪️ *${item.name}*\n`
      message += `   Cantidad: ${item.quantity} vial(es)\n`
      message += `   Valor ref: USD ${item.price.toLocaleString("en-US")}\n\n`
    })
    
    message += "----------------------------------\n"
    message += `🧪 *VALOR TOTAL ESTIMADO:* USD ${totalPrice.toLocaleString("en-US")}\n`
    message += "----------------------------------\n\n"
    message += "👉 Quedo a la espera de las instrucciones de facturación y verificación de lote para efectuar la transferencia."

    // Codificamos el texto para que sea una URL válida de WhatsApp
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank")
  }
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscuro traslúcido con cierre al hacer clic */}
      <div 
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-md transform bg-background shadow-2xl transition-all border-l border-border">
          <div className="flex h-full flex-col bg-white">
            
            {/* Encabezado de la ventana */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5 bg-primary text-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-cyan-rx" />
                <h2 className="font-heading text-lg font-semibold tracking-wide uppercase">
                  Tu Carrito ({totalItems})
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className="rounded-full p-1 text-silver hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>

            {/* Cuerpo: Lista de productos */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                  <ShoppingBag className="size-16 stroke-[1] mb-4 text-silver-muted" />
                  <p className="font-heading text-lg font-medium">El carrito está vacío</p>
                  <p className="text-sm mt-1 max-w-[240px]">Explorá el catálogo para añadir compuestos de investigación.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {cart.map((item) => (
                    <div key={item.id} className="flex py-5 gap-4">
                      <div className="flex-1">
                        <h3 className="font-heading text-base font-medium text-primary">{item.name}</h3>
                        <p className="text-sm font-semibold text-secondary mt-1">
                          USD {item.price.toLocaleString("en-US")} c/u
                        </p>
                        
                        {/* Selector de cantidad */}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center rounded-full border border-border bg-muted/40 p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="rounded-full p-1 hover:bg-white transition-colors text-muted-foreground"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-primary">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="rounded-full p-1 hover:bg-white transition-colors text-muted-foreground"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-red-500 hover:underline font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-between">
                        <span className="font-semibold text-primary">
                          USD {(item.price * item.quantity).toLocaleString("en-US")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pie de la ventana: Totales y Botón de WhatsApp */}
            {cart.length > 0 && (
              <div className="border-t border-border bg-muted/30 px-6 py-6">
                <div className="flex justify-between text-base font-semibold text-primary mb-4">
                  <span>Total estimado:</span>
                  <span className="text-xl font-bold text-primary">
                    USD {totalPrice.toLocaleString("en-US")}
                  </span>
                </div>
                {/* 🚀 AGREGAR EN LA PARTE INFERIOR DEL CARRITO, CERCA DEL BOTÓN DE WHATSAPP */}
                 <div className="mt-4 rounded-xl bg-muted/50 p-3.5 border border-border text-left">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                   💡 <strong>Cómo finalizar:</strong> Terminá tu orden por WhatsApp tocando el botón de abajo <strong>"Enviar pedido"</strong>. Nuestro equipo coordinará el pago y el despacho térmico de inmediato.
                 </p>
                 <a 
                   href="/blog/como-comprar" 
                   className="mt-2 inline-block text-[11px] font-bold text-cyan-rx hover:underline uppercase tracking-wider"
                    >
                 📖 Guía paso a paso: ¿Cómo comprar?
                  </a>
                 </div>
                <button
                  onClick={handleCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-cyan-rx py-4 text-sm font-bold tracking-wider text-primary uppercase shadow-md hover:bg-cyan-rx-dark transition-all transition-transform hover:-translate-y-0.5"
                >
                  <MessageSquare className="size-4 fill-primary" />
                  Enviar Pedido por WhatsApp
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}