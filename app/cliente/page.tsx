"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockAPI } from "@/lib/services"
import type { MenuItem } from "@/lib/types"
import { ShoppingCart, Star, Calendar, LogOut } from "lucide-react"

export default function ClientePage() {
  const router = useRouter()
  const { currentRole, logout } = useAuthStore()
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Ceviches")

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "cliente") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  useEffect(() => {
    loadMenu()
  }, [])

  const loadMenu = async () => {
    const menuData = await mockAPI.getMenu()
    setMenu(menuData.filter((m) => m.disponible))
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (currentRole !== "cliente") return null

  const categories = ["Ceviches", "Entradas", "Arroces", "Frituras", "Bebidas", "Postres"]
  const filteredMenu = menu.filter((item) => item.categoria === selectedCategory)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">D'Stephano</h1>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" onClick={() => router.push("/cliente/delivery")}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pedir Delivery
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/cliente/pedido")}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Rastrear Pedido
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Reservar
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/feedback")}>
              <Star className="h-4 w-4 mr-2" />
              Feedback
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative h-64 bg-gradient-to-b from-gray-100 to-white">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Comida Marina Peruana</h2>
          <p className="text-lg text-gray-600">Auténticos sabores del mar</p>
          <div className="flex items-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-sm text-gray-600">4.6 (84 reseñas)</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-16 z-40 bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "" : "bg-white"}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="container mx-auto px-4 py-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{selectedCategory}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <span className="text-6xl">🐟</span>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{item.nombre}</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    S/ {item.precioDelivery.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{item.descripcion}</p>
                <div className="flex gap-2 mb-4">
                  {item.etiquetas.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-12">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>D'Stephano - Restaurante de Comida Marina</p>
          <p className="mt-2">Horario: 11:00 - 17:00 | Delivery disponible</p>
        </div>
      </footer>
    </div>
  )
}
