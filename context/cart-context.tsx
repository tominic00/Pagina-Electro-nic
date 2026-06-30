"use client"

import { createContext, useContext, useEffect, useState } from "react"

// 🔢 Agregamos 'stock' al tipo de item para controlar las unidades reales
export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  stock: number 
}

type CartContextType = {
  cart: CartItem[]
  addToCart: (product: Omit<CartItem, "quantity">) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  totalPrice: number
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 1. Cargar el carrito guardado en el navegador al entrar a la página
  useEffect(() => {
    const savedCart = localStorage.getItem("peptiage-cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error al cargar el carrito", error)
      }
    }
    setIsLoaded(true)
  }, [])

  // 2. Guardar el carrito cada vez que hay un cambio
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("peptiage-cart", JSON.stringify(cart))
    }
  }, [cart, isLoaded])

  // 🛑 CONTROL DE STOCK AL AÑADIR DESDE EL CATÁLOGO
  const addToCart = (product: Omit<CartItem, "quantity">) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        // Si sumarle 1 supera el stock disponible en Supabase, lo frena
        if (existing.quantity >= product.stock) {
          alert(`Disculpe, el stock máximo disponible para investigación es de ${product.stock} vial(es).`)
          return prev
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  // 🛑 CONTROL DE STOCK AL TOCAR LOS BOTONES (+) Y (-) DEL DRAWER
const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // Aseguramos que el stock sea un número real. Si no viene, usamos el de Supabase.
          const stockLimite = Number(item.stock) || 1

          if (quantity > stockLimite) {
            alert(`Acción limitada. El stock disponible en depósito es de ${stockLimite} vial(es).`)
            return item // Mantiene la cantidad anterior si supera el stock
          }
          return { ...item, quantity }
        }
        return item
      })
    )
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, totalPrice, totalItems }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider")
  }
  return context
}