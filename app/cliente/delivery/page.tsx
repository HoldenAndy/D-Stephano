"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockAPI } from "@/lib/services"
import type { MenuItem, DeliveryOrder, PaymentMethod } from "@/lib/types"
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, Package } from "lucide-react"
import { toast } from "sonner"

interface CartItem {
  item: MenuItem
  cantidad: number
  notas: string
}

export default function DeliveryOrderPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const { addOrder } = useStore()
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Ceviches")
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)

  // Customer form data
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [deliveryZone, setDeliveryZone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo")
  const [cashAmount, setCashAmount] = useState("")
  const [orderNotes, setOrderNotes] = useState("")

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

  const addToCart = (item: MenuItem) => {
    const existing = cart.find((c) => c.item.id === item.id)
    if (existing) {
      setCart(cart.map((c) => (c.item.id === item.id ? { ...c, cantidad: c.cantidad + 1 } : c)))
    } else {
      setCart([...cart, { item, cantidad: 1, notas: "" }])
    }
    toast.success(`${item.nombre} agregado al carrito`)
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(
      cart
        .map((c) => (c.item.id === itemId ? { ...c, cantidad: c.cantidad + delta } : c))
        .filter((c) => c.cantidad > 0),
    )
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.item.id !== itemId))
    toast.success("Item eliminado del carrito")
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, c) => sum + c.item.precioDelivery * c.cantidad, 0)
  }

  const calculateDeliveryFee = () => {
    const zones: Record<string, number> = {
      miraflores: 8,
      "san-isidro": 10,
      barranco: 8,
      "la-molina": 12,
      surco: 10,
    }
    return zones[deliveryZone] || 10
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const deliveryFee = calculateDeliveryFee()
    const igv = (subtotal + deliveryFee) * 0.18
    return subtotal + deliveryFee + igv
  }

  const handleSubmitOrder = () => {
    // Validation
    if (!customerName.trim()) {
      toast.error("Por favor ingresa tu nombre")
      return
    }
    if (!customerPhone.trim()) {
      toast.error("Por favor ingresa tu número de teléfono")
      return
    }
    if (!customerAddress.trim()) {
      toast.error("Por favor ingresa tu dirección")
      return
    }
    if (!deliveryZone) {
      toast.error("Por favor selecciona una zona de delivery")
      return
    }
    if (cart.length === 0) {
      toast.error("Tu carrito está vacío")
      return
    }
    if (paymentMethod === "efectivo" && !cashAmount.trim()) {
      toast.error("Por favor indica con cuánto vas a pagar")
      return
    }

    const subtotal = calculateSubtotal()
    const deliveryFee = calculateDeliveryFee()
    const igv = (subtotal + deliveryFee) * 0.18
    const total = subtotal + deliveryFee + igv

    // Create delivery order
    const newOrder: DeliveryOrder = {
      id: `del-${Date.now()}`,
      tipo: "delivery",
      type: "delivery",
      items: cart.map((c) => ({
        id: `item-${Date.now()}-${c.item.id}`,
        menuItemId: c.item.id,
        cantidad: c.cantidad,
        modificadores: [],
        notas: c.notas,
        estacion: c.item.estacion,
        estado: "nuevo",
      })),
      subtotal,
      igv,
      propina: 0,
      total,
      estado: "nuevo",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      direccion: customerAddress,
      deliveryAddress: customerAddress,
      deliveryPhone: customerPhone,
      zona: deliveryZone,
      deliveryZone,
      tarifaEnvio: deliveryFee,
      deliveryFee,
      estadoDelivery: "recibido",
      tiempoEstimado: 30,
    }

    // Save to store
    addOrder(newOrder)

    // Clear cart and form
    setCart([])
    setCustomerName("")
    setCustomerPhone("")
    setCustomerAddress("")
    setDeliveryZone("")
    setPaymentMethod("efectivo")
    setCashAmount("")
    setOrderNotes("")
    setShowCheckout(false)

    toast.success("¡Pedido realizado con éxito!")
    router.push("/cliente/pedido")
  }

  if (currentRole !== "cliente") return null

  const categories = ["Ceviches", "Entradas", "Arroces", "Frituras", "Bebidas", "Postres"]
  const filteredMenu = menu.filter((item) => item.categoria === selectedCategory)

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.push("/cliente")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Pedir Delivery</h1>
          <Button variant="outline" size="sm" onClick={() => setShowCheckout(true)} disabled={cart.length === 0}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {cart.length}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Categories */}
            <Card>
              <CardContent className="p-4">
                <ScrollArea className="w-full">
                  <div className="flex gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                        className="whitespace-nowrap"
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenu.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{item.nombre}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        S/ {item.precioDelivery.toFixed(2)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{item.descripcion}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.etiquetas.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full" size="sm" onClick={() => addToCart(item)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Tu Pedido ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tu carrito está vacío</p>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {cart.map((cartItem) => (
                          <div key={cartItem.item.id} className="flex gap-3 p-3 bg-sand rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{cartItem.item.nombre}</p>
                              <p className="text-xs text-muted-foreground">
                                S/ {cartItem.item.precioDelivery.toFixed(2)} c/u
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-transparent"
                                onClick={() => updateQuantity(cartItem.item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-6 text-center">{cartItem.cantidad}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 bg-transparent"
                                onClick={() => updateQuantity(cartItem.item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeFromCart(cartItem.item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>S/ {calculateSubtotal().toFixed(2)}</span>
                      </div>
                      {deliveryZone && (
                        <div className="flex justify-between text-sm">
                          <span>Delivery</span>
                          <span>S/ {calculateDeliveryFee().toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span>IGV (18%)</span>
                        <span>
                          S/ {((calculateSubtotal() + (deliveryZone ? calculateDeliveryFee() : 0)) * 0.18).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span>S/ {deliveryZone ? calculateTotal().toFixed(2) : "---"}</span>
                      </div>
                    </div>

                    <Button className="w-full" onClick={() => setShowCheckout(true)}>
                      Continuar al Checkout
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Datos de Entrega</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowCheckout(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <ScrollArea className="h-[calc(90vh-180px)]">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Juan Pérez"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Número de Teléfono *</Label>
                  <Input
                    id="phone"
                    placeholder="Ej: 987654321"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección Completa *</Label>
                  <Textarea
                    id="address"
                    placeholder="Ej: Av. Larco 1234, Dpto 501, Miraflores"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zone">Zona de Delivery *</Label>
                  <Select value={deliveryZone} onValueChange={setDeliveryZone}>
                    <SelectTrigger id="zone">
                      <SelectValue placeholder="Selecciona tu zona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miraflores">Miraflores (S/ 8)</SelectItem>
                      <SelectItem value="san-isidro">San Isidro (S/ 10)</SelectItem>
                      <SelectItem value="barranco">Barranco (S/ 8)</SelectItem>
                      <SelectItem value="la-molina">La Molina (S/ 12)</SelectItem>
                      <SelectItem value="surco">Surco (S/ 10)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment">Método de Pago *</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <SelectTrigger id="payment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="yape">Yape</SelectItem>
                      <SelectItem value="plin">Plin</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "efectivo" && (
                  <div className="space-y-2">
                    <Label htmlFor="cash">¿Con cuánto vas a pagar? *</Label>
                    <Input
                      id="cash"
                      type="number"
                      placeholder="Ej: 100"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                    />
                    {cashAmount && (
                      <p className="text-sm text-muted-foreground">
                        Vuelto: S/ {(Number.parseFloat(cashAmount) - calculateTotal()).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Ej: Tocar el timbre 2 veces"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="bg-sand p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Resumen del Pedido</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal ({cart.length} items)</span>
                      <span>S/ {calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>S/ {deliveryZone ? calculateDeliveryFee().toFixed(2) : "---"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IGV (18%)</span>
                      <span>
                        S/ {deliveryZone ? ((calculateSubtotal() + calculateDeliveryFee()) * 0.18).toFixed(2) : "---"}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t">
                      <span>Total</span>
                      <span>S/ {deliveryZone ? calculateTotal().toFixed(2) : "---"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
            <div className="border-t p-4 flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCheckout(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleSubmitOrder}>
                Confirmar Pedido
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
