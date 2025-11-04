"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockAPI } from "@/lib/services"
import type { Order, PaymentMethod } from "@/lib/types"
import { toast } from "sonner"
import { CreditCard, Banknote, Smartphone, Receipt, QrCode, Star } from "lucide-react"

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: any }[] = [
  { id: "efectivo", label: "Efectivo", icon: Banknote },
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
  { id: "yape", label: "Yape", icon: Smartphone },
  { id: "plin", label: "Plin", icon: Smartphone },
  { id: "transferencia", label: "Transferencia", icon: CreditCard },
]

export default function CajaPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("efectivo")
  const [propina, setPropina] = useState("")
  const [descuento, setDescuento] = useState("")
  const [comprobanteTipo, setComprobanteTipo] = useState<"boleta" | "factura">("boleta")
  const [ruc, setRuc] = useState("")

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "caja") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const ordersData = await mockAPI.getOrders()
    setOrders(ordersData.filter((o) => o.estado === "listo"))
  }

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order)
    setPaymentDialogOpen(true)
    setPropina(Math.round(order.total * 0.1).toString())
  }

  const handleProcessPayment = async () => {
    if (!selectedOrder) return

    const propinaAmount = Number.parseFloat(propina || "0")
    const descuentoAmount = Number.parseFloat(descuento || "0")
    const finalTotal = selectedOrder.total + propinaAmount - descuentoAmount

    await mockAPI.updateOrder(selectedOrder.id, {
      estado: "servido",
      propina: propinaAmount,
    })

    toast.success("Pago procesado exitosamente")
    setPaymentDialogOpen(false)
    setSelectedOrder(null)
    setPropina("")
    setDescuento("")
    loadOrders()

    // Simulate receipt generation
    setTimeout(() => {
      toast.success("Comprobante generado - Enviado por WhatsApp")
    }, 1000)
  }

  if (currentRole !== "caja") return null

  const totalVentas = orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <AppShell
      title="Punto de Venta"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Cuentas Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">S/ {totalVentas.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">S/ 2,450.00</div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Cuentas por Cobrar</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No hay cuentas pendientes</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {order.tipo === "mesa" ? `Mesa #${order.mesaId?.replace("t", "")}` : "Delivery"}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.items.length} ítems</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-2xl font-bold">S/ {order.total.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Inc. IGV</p>
                      </div>
                      <Button onClick={() => handleSelectOrder(order)}>
                        <Receipt className="h-4 w-4 mr-2" />
                        Cobrar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>S/ {selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>IGV (18%)</span>
                      <span>S/ {selectedOrder.igv.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>S/ {selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Propina y Descuento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propina">Propina (Sugerida 10%)</Label>
                  <Input
                    id="propina"
                    type="number"
                    step="0.01"
                    value={propina}
                    onChange={(e) => setPropina(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="descuento">Descuento</Label>
                  <Input
                    id="descuento"
                    type="number"
                    step="0.01"
                    value={descuento}
                    onChange={(e) => setDescuento(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Total Final */}
              <Card className="bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total a Pagar</span>
                    <span className="text-3xl font-bold">
                      S/{" "}
                      {(
                        selectedOrder.total +
                        Number.parseFloat(propina || "0") -
                        Number.parseFloat(descuento || "0")
                      ).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <div>
                <Label className="mb-3 block">Método de Pago</Label>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon
                    return (
                      <Button
                        key={method.id}
                        variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                        className="h-20 flex flex-col gap-2"
                        onClick={() => setSelectedPaymentMethod(method.id)}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs">{method.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Comprobante */}
              <div>
                <Label className="mb-3 block">Tipo de Comprobante</Label>
                <Tabs value={comprobanteTipo} onValueChange={(v) => setComprobanteTipo(v as any)}>
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="boleta">Boleta</TabsTrigger>
                    <TabsTrigger value="factura">Factura</TabsTrigger>
                  </TabsList>

                  <TabsContent value="factura" className="mt-4">
                    <div>
                      <Label htmlFor="ruc">RUC</Label>
                      <Input
                        id="ruc"
                        value={ruc}
                        onChange={(e) => setRuc(e.target.value)}
                        placeholder="20123456789"
                        maxLength={11}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Validación SUNAT simulada</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setPaymentDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleProcessPayment}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Procesar Pago
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
