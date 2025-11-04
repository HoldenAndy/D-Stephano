"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import type { DeliveryOrder } from "@/lib/types"
import { MapPin, Clock, Package, Truck, CheckCircle2, Star } from "lucide-react"

export default function DeliveryPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const [orders, setOrders] = useState<DeliveryOrder[]>([])

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "delivery") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const { orders } = useStore.getState()
    const deliveryOrders = orders.filter((o) => o.tipo === "delivery") as DeliveryOrder[]
    setOrders(deliveryOrders)
  }

  const handleUpdateStatus = (orderId: string, newStatus: DeliveryOrder["estadoDelivery"]) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, estadoDelivery: newStatus } : o)))
  }

  if (currentRole !== "delivery") return null

  const recibidos = orders.filter((o) => o.estadoDelivery === "recibido")
  const enPreparacion = orders.filter((o) => o.estadoDelivery === "en-preparacion")
  const enCamino = orders.filter((o) => o.estadoDelivery === "en-camino")
  const entregados = orders.filter((o) => o.estadoDelivery === "entregado")

  const getStatusColor = (status: DeliveryOrder["estadoDelivery"]) => {
    switch (status) {
      case "recibido":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
      case "en-preparacion":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50"
      case "en-camino":
        return "bg-purple-500/20 text-purple-500 border-purple-500/50"
      case "entregado":
        return "bg-green-500/20 text-green-500 border-green-500/50"
      default:
        return ""
    }
  }

  return (
    <AppShell
      title="Gestión de Delivery"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/feedback")} className="bg-transparent">
            <Star className="h-4 w-4 mr-2" />
            Feedback
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recibidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{recibidos.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">En Preparación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enPreparacion.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">En Camino</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enCamino.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Entregados Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{entregados.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders */}
        <Tabs defaultValue="recibidos">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="recibidos">Recibidos ({recibidos.length})</TabsTrigger>
            <TabsTrigger value="preparacion">En Prep ({enPreparacion.length})</TabsTrigger>
            <TabsTrigger value="camino">En Camino ({enCamino.length})</TabsTrigger>
            <TabsTrigger value="entregados">Entregados ({entregados.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="recibidos" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recibidos.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                        <Badge className={`mt-2 border ${getStatusColor(order.estadoDelivery)}`}>
                          {order.estadoDelivery}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">S/ {order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Inc. envío</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{order.direccion}</p>
                          <p className="text-xs text-muted-foreground">Zona: {order.zona}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Tiempo estimado: {order.tiempoEstimado} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="h-4 w-4" />
                        <span>{order.items.length} ítems</span>
                      </div>
                    </div>

                    {/* Static Map Placeholder */}
                    <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>

                    <Button className="w-full" onClick={() => handleUpdateStatus(order.id, "en-preparacion")}>
                      <Truck className="h-4 w-4 mr-2" />
                      Asignar Repartidor
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="preparacion" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enPreparacion.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                        <Badge className={`mt-2 border ${getStatusColor(order.estadoDelivery)}`}>
                          {order.estadoDelivery}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">S/ {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm">{order.direccion}</p>
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => handleUpdateStatus(order.id, "en-camino")}>
                      <Truck className="h-4 w-4 mr-2" />
                      Marcar En Camino
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="camino" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enCamino.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                        <Badge className={`mt-2 border ${getStatusColor(order.estadoDelivery)}`}>
                          {order.estadoDelivery}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">S/ {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                        <p className="text-sm">{order.direccion}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleUpdateStatus(order.id, "entregado")}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Marcar Entregado
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="entregados" className="mt-4">
            <p className="text-center py-8 text-muted-foreground">No hay entregas completadas hoy</p>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
