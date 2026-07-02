"use client"

import { useCart } from "@/context/cart-context"
import { X, Plus, Minus, ShoppingBag, MessageSquare, Info, CreditCard, Bitcoin } from "lucide-react"

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart()

  // 🚀 LÓGICA INTELIGENTE: Detectar si hay un iPhone en el carrito
  // Busca si la categoría es iPhone o si la palabra "iphone" está en el nombre del producto
  const hasIphone = cart.some(
    (item: any) => item.category === "iPhone" || item.name.toLowerCase().includes("iphone")
  )

  const handleWhatsAppCheckout = () => {
    const phone = "5493812184858" 
    
    let message = "📱 *COMPRA DE EQUIPO - ELECTRONIC*\n\n"
    message += "Hola, quiero coordinar el pago y la entrega de mi pedido:\n\n"
    
    cart.forEach((item) => {
      message += `▪️ *${item.name}*\n`
      message += `   Cantidad: ${item.quantity} unidad(es)\n`
      message += `   Precio ref: USD ${item.price.toLocaleString("en-US")}\n\n`
    })
    
    message += "----------------------------------\n"
    message += `💰 *TOTAL ESTIMADO:* USD ${totalPrice.toLocaleString("en-US")}\n`
    message += "----------------------------------\n\n"
    message += "👉 Aguardo información sobre disponibilidad y formas de pago."

    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank")
  }

  const handleWebCheckout = (metodo: "mercadopago" | "usdt") => {
    // ⚠️ Acá en el futuro conectaremos con la página de pagos o la API
    console.log(`Iniciando pago con ${metodo}...`)
    alert(`Redirigiendo a la pasarela de ${metodo.toUpperCase()}... (Próximamente)`)
  }
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscuro traslúcido */}
      <div 
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="pointer-events-auto w-screen max-w-md transform bg-background shadow-2xl transition-all border-l border-border">
          <div className="flex h-full flex-col bg-white">
            
            {/* Encabezado */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5 bg-white text-foreground">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-primary" />
                <h2 className="font-bold text-lg tracking-tight">
                  Tu Carrito ({totalItems})
                </h2>
              </div>
              <button 
                onClick={onClose} 
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Cuerpo: Lista de productos */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                  <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <ShoppingBag className="size-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-xl font-bold tracking-tight text-foreground">Tu carrito está vacío</p>
                  <p className="text-sm mt-2 max-w-[240px]">Agregá equipos o accesorios para verlos acá.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {cart.map((item) => (
                    <div key={item.id} className="flex py-6 gap-4 group">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-foreground leading-tight">{item.name}</h3>
                        <p className="text-sm font-semibold text-muted-foreground mt-1">
                          USD {item.price.toLocaleString("en-US")} c/u
                        </p>
                        
                        {/* Selector de cantidad */}
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="rounded-lg p-1.5 hover:bg-white hover:shadow-sm transition-all text-foreground active:scale-95"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="rounded-lg p-1.5 hover:bg-white hover:shadow-sm transition-all text-foreground active:scale-95"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs font-semibold text-destructive/70 hover:text-destructive transition-colors"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-between">
                        <span className="font-bold text-lg text-foreground tracking-tighter">
                          USD {(item.price * item.quantity).toLocaleString("en-US")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pie del carrito: Lógica Condicional de Pagos */}
            {cart.length > 0 && (
              <div className="border-t border-border bg-white px-6 py-6 pb-8 shadow-[0_-10px_30px_rgb(0,0,0,0.05)]">
                <div className="flex justify-between items-end mb-6">
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Total a Pagar</span>
                  <span className="text-3xl font-bold tracking-tighter text-foreground">
                    USD {totalPrice.toLocaleString("en-US")}
                  </span>
                </div>
                
                {hasIphone ? (
                  /* 📱 RUTA IPHONE: Solo WhatsApp */
                  <>
                    <div className="mb-6 rounded-2xl bg-muted/50 p-4 border border-border">
                      <div className="flex gap-3">
                        <Info className="size-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-foreground leading-relaxed">
                            Como tu carrito incluye un <strong>iPhone</strong>, la compra se coordina de manera personalizada para garantizarte la mejor cotización y opciones de entrega.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleWhatsAppCheckout}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-4 text-sm font-bold tracking-tight text-white shadow-md hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                    >
                      <MessageSquare className="size-4" />
                      Coordinar compra por WhatsApp
                    </button>
                  </>
                ) : (
                  /* 🛒 RUTA ACCESORIOS: Pago Web Directo */
                  <div className="space-y-3">
                    <button
                      onClick={() => handleWebCheckout("mercadopago")}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#009EE3] py-4 text-sm font-bold tracking-tight text-white shadow-md hover:bg-[#0089C4] transition-all active:scale-95"
                    >
                      <CreditCard className="size-5" />
                      Pagar con Mercado Pago
                    </button>
                    
                    <button
                      onClick={() => handleWebCheckout("usdt")}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#26A17B] py-4 text-sm font-bold tracking-tight text-white shadow-md hover:bg-[#1E8363] transition-all active:scale-95"
                    >
                      <Bitcoin className="size-5" />
                      Pagar con USDT (Crypto)
                    </button>

                    <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
                      Pago seguro encriptado
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}