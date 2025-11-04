"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, Clock, CheckCircle2, Truck, MapPin, Phone } from "lucide-react"
import { useStore } from "@/lib/store"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function PedidoClientePage() {
  const { orders, loadData } = useStore()
  const [orderId, setOrderId] = useState("")
  const [phone, setPhone] = useState("")
  const [foundOrder, setFoundOrder] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = () => {
    const order = orders.find((o) => o.id.toLowerCase().includes(orderId.toLowerCase()) && o.type === "delivery")
    setFoundOrder(order || null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "preparing":
        return <Clock className="h-5 w-5" />
      case "ready":
        return <Package className="h-5 w-5" />
      case "delivering":
        return <Truck className="h-5 w-5" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Recibido"
      case "preparing":
        return "En Preparación"
      case "ready":
        return "Listo para Envío"
      case "delivering":
        return "En Camino"
      case "completed":
        return "Entregado"
      default:
        return status
    }
  }

  const getEstimatedTime = (status: string) => {
    switch (status) {
      case "pending":
        return "30-40 min"
      case "preparing":
        return "20-30 min"
      case "ready":
        return "15-20 min"
      case "delivering":
        return "10-15 min"
      case "completed":
        return "Entregado"
      default:
        return "Calculando..."
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Seguimiento de Pedido</h1>
          <p className="text-muted-foreground">Rastrea tu pedido en tiempo real</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Buscar Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orderId">Número de Pedido</Label>
              <Input
                id="orderId"
                placeholder="Ej: ORD-12345"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+51 999 999 999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} className="w-full">
              Buscar Pedido
            </Button>
          </CardContent>
        </Card>

        {foundOrder ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pedido #{foundOrder.id.slice(0, 8)}</CardTitle>
                  <Badge variant="default">{getStatusText(foundOrder.status)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Realizado el {format(new Date(foundOrder.createdAt), "PPp", { locale: es })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Timeline */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                    {["pending", "preparing", "ready", "delivering", "completed"].map((status, idx) => {
                      const isActive =
                        ["pending", "preparing", "ready", "delivering", "completed"].indexOf(foundOrder.status) >= idx
                      const isCurrent = foundOrder.status === status

                      return (
                        <div key={status} className="relative flex items-start gap-4 pb-8 last:pb-0">
                          <div
                            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                              isActive
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background"
                            }`}
                          >
                            {getStatusIcon(status)}
                          </div>
                          <div className="flex-1 pt-1">
                            <p className={`font-medium ${isCurrent ? "text-primary" : ""}`}>{getStatusText(status)}</p>
                            {isCurrent && (
                              <p className="text-sm text-muted-foreground">
                                Tiempo estimado: {getEstimatedTime(status)}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Delivery Info */}
                  {foundOrder.deliveryAddress && (
                    <div className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Dirección de Entrega</p>
                          <p className="text-sm text-muted-foreground">{foundOrder.deliveryAddress}</p>
                        </div>
                      </div>
                      {foundOrder.deliveryPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm">{foundOrder.deliveryPhone}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Items */}
                  <div>
                    <h3 className="font-medium mb-3">Detalle del Pedido</h3>
                    <div className="space-y-2">
                      {foundOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium">S/ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex items-center justify-between font-bold">
                          <span>Total</span>
                          <span className="font-medium">S/ {foundOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Static Map Placeholder */}
            {foundOrder.status === "delivering" && (
              <Card>
                <CardHeader>
                  <CardTitle>Ubicación del Repartidor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Truck className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Mapa en tiempo real</p>
                      <p className="text-xs text-muted-foreground mt-1">Tu pedido está en camino</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          orderId && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No se encontró el pedido</p>
                <p className="text-sm text-muted-foreground mt-1">Verifica el número de pedido e intenta nuevamente</p>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  )
}
