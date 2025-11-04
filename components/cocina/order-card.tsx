"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Printer, CheckCircle2, PlayCircle } from "lucide-react"
import type { Order, OrderItem } from "@/lib/types"
import { cn } from "@/lib/utils"

interface OrderCardProps {
  order: Order
  items: OrderItem[]
  onAccept: (orderId: string) => void
  onMarkReady: (orderId: string) => void
  onReprint: (orderId: string) => void
}

const STATION_COLORS = {
  frio: "bg-blue-500/20 text-blue-500 border-blue-500/50",
  plancha: "bg-orange-500/20 text-orange-500 border-orange-500/50",
  fritura: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
  parrilla: "bg-red-500/20 text-red-500 border-red-500/50",
  postres: "bg-pink-500/20 text-pink-500 border-pink-500/50",
  barra: "bg-purple-500/20 text-purple-500 border-purple-500/50",
}

export function OrderCard({ order, items, onAccept, onMarkReady, onReprint }: OrderCardProps) {
  const getElapsedTime = () => {
    const minutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)
    return `${minutes} min`
  }

  const isNew = order.estado === "nuevo"
  const isInProgress = order.estado === "en-preparacion"
  const isReady = order.estado === "listo"

  return (
    <Card className={cn("hover:shadow-lg transition-all", isNew && "border-yellow-500", isReady && "border-green-500")}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold">
                {order.tipo === "mesa" ? `Mesa #${order.mesaId?.replace("t", "")}` : "Delivery"}
              </span>
              {isNew && <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 border">NUEVO</Badge>}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{getElapsedTime()}</span>
              <span>•</span>
              <span>{items.length} ítems</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onReprint(order.id)}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">
                    {item.cantidad}x Item {index + 1}
                  </span>
                  <Badge className={cn("border text-xs", STATION_COLORS[item.estacion])}>{item.estacion}</Badge>
                </div>
                {item.notas && (
                  <p className="text-sm text-muted-foreground italic mt-1">
                    <span className="font-medium">Notas:</span> {item.notas}
                  </p>
                )}
                {item.modificadores.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">Mods:</span> {item.modificadores.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          {isNew && (
            <Button className="flex-1" onClick={() => onAccept(order.id)}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Aceptar
            </Button>
          )}
          {isInProgress && (
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => onMarkReady(order.id)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Marcar Listo
            </Button>
          )}
          {isReady && (
            <div className="flex-1 text-center py-2 text-green-500 font-medium">
              <CheckCircle2 className="h-5 w-5 inline mr-2" />
              Listo para servir
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
