"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import { OrderCard } from "@/components/cocina/order-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAPI } from "@/lib/services"
import type { Order, KitchenStation } from "@/lib/types"
import { toast } from "sonner"
import { Filter, Star } from "lucide-react"

const STATIONS: { id: KitchenStation; label: string }[] = [
  { id: "frio", label: "Frío/Cevichería" },
  { id: "plancha", label: "Plancha" },
  { id: "fritura", label: "Fritura" },
  { id: "parrilla", label: "Parrilla" },
  { id: "postres", label: "Postres" },
  { id: "barra", label: "Barra" },
]

export default function CocinaPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedStation, setSelectedStation] = useState<KitchenStation | "all">("all")
  const [view, setView] = useState<"nuevos" | "en-preparacion" | "listos">("nuevos")

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "cocina") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  useEffect(() => {
    loadOrders()
    // Simulate real-time updates
    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadOrders = async () => {
    const ordersData = await mockAPI.getOrders()
    setOrders(ordersData)
  }

  const handleAccept = async (orderId: string) => {
    await mockAPI.updateOrder(orderId, { estado: "en-preparacion" })
    toast.success("Pedido aceptado")
    loadOrders()
  }

  const handleMarkReady = async (orderId: string) => {
    await mockAPI.updateOrder(orderId, { estado: "listo" })
    toast.success("Pedido marcado como listo")
    loadOrders()
  }

  const handleReprint = (orderId: string) => {
    toast.info("Reimprimiendo ticket...")
    // Simulate PDF download
    setTimeout(() => {
      toast.success("Ticket descargado")
    }, 1000)
  }

  if (currentRole !== "cocina") return null

  const filterOrdersByStation = (ordersList: Order[]) => {
    if (selectedStation === "all") return ordersList
    return ordersList.filter((order) => order.items.some((item) => item.estacion === selectedStation))
  }

  const nuevosOrders = filterOrdersByStation(orders.filter((o) => o.estado === "nuevo"))
  const enPreparacionOrders = filterOrdersByStation(orders.filter((o) => o.estado === "en-preparacion"))
  const listosOrders = filterOrdersByStation(orders.filter((o) => o.estado === "listo"))

  return (
    <AppShell
      title="Kitchen Display System"hideBackButton={true}
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/feedback")} className="bg-transparent">
            <Star className="h-4 w-4 mr-2" />
            Feedback
          </Button>
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
            {nuevosOrders.length} Nuevos
          </Badge>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/50">
            {enPreparacionOrders.length} En Prep
          </Badge>
          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
            {listosOrders.length} Listos
          </Badge>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Station Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Button
            variant={selectedStation === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStation("all")}
          >
            Todas
          </Button>
          {STATIONS.map((station) => (
            <Button
              key={station.id}
              variant={selectedStation === station.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStation(station.id)}
            >
              {station.label}
            </Button>
          ))}
        </div>

        {/* Orders by Status */}
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="nuevos">Nuevos ({nuevosOrders.length})</TabsTrigger>
            <TabsTrigger value="en-preparacion">En Preparación ({enPreparacionOrders.length})</TabsTrigger>
            <TabsTrigger value="listos">Listos ({listosOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="nuevos" className="mt-4">
            {nuevosOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No hay pedidos nuevos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nuevosOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    items={order.items}
                    onAccept={handleAccept}
                    onMarkReady={handleMarkReady}
                    onReprint={handleReprint}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="en-preparacion" className="mt-4">
            {enPreparacionOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No hay pedidos en preparación</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enPreparacionOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    items={order.items}
                    onAccept={handleAccept}
                    onMarkReady={handleMarkReady}
                    onReprint={handleReprint}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="listos" className="mt-4">
            {listosOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No hay pedidos listos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listosOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    items={order.items}
                    onAccept={handleAccept}
                    onMarkReady={handleMarkReady}
                    onReprint={handleReprint}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
