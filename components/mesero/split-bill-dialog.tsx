"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Users, DollarSign, List } from "lucide-react"
import type { Order } from "@/lib/types"
import { toast } from "sonner"

interface SplitBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  onConfirm: (splits: any[]) => void
}

export function SplitBillDialog({ open, onOpenChange, order, onConfirm }: SplitBillDialogProps) {
  const [splitMethod, setSplitMethod] = useState<"personas" | "items" | "monto">("personas")
  const [numPersonas, setNumPersonas] = useState("2")
  const [customAmount, setCustomAmount] = useState("")

  if (!order) return null

  const total = order.total

  const handleSplitByPersonas = () => {
    const num = Number.parseInt(numPersonas)
    const perPerson = total / num
    const splits = Array.from({ length: num }, (_, i) => ({
      persona: i + 1,
      monto: perPerson,
    }))
    onConfirm(splits)
    toast.success(`Cuenta dividida en ${num} partes`)
    onOpenChange(false)
  }

  const handleSplitByMonto = () => {
    const amount = Number.parseFloat(customAmount)
    if (amount <= 0 || amount > total) {
      toast.error("Monto inválido")
      return
    }
    const splits = [
      { persona: 1, monto: amount },
      { persona: 2, monto: total - amount },
    ]
    onConfirm(splits)
    toast.success("Cuenta dividida por monto")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dividir Cuenta - Total: S/ {total.toFixed(2)}</DialogTitle>
        </DialogHeader>

        <Tabs value={splitMethod} onValueChange={(v) => setSplitMethod(v as any)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="personas">
              <Users className="h-4 w-4 mr-2" />
              Por Persona
            </TabsTrigger>
            <TabsTrigger value="items">
              <List className="h-4 w-4 mr-2" />
              Por Ítems
            </TabsTrigger>
            <TabsTrigger value="monto">
              <DollarSign className="h-4 w-4 mr-2" />
              Por Monto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personas" className="space-y-4">
            <div>
              <Label htmlFor="numPersonas">Número de Personas</Label>
              <Input
                id="numPersonas"
                type="number"
                min="2"
                max="12"
                value={numPersonas}
                onChange={(e) => setNumPersonas(e.target.value)}
              />
            </div>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Cada persona paga:</p>
              <p className="text-2xl font-bold">S/ {(total / Number.parseInt(numPersonas || "2")).toFixed(2)}</p>
            </Card>
            <Button className="w-full" onClick={handleSplitByPersonas}>
              Dividir en {numPersonas} Partes
            </Button>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Item {index + 1}</span>
                  <span className="font-medium">S/ {((order.subtotal / order.items.length) * 1.18).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Selecciona ítems para asignar a cada persona (próximamente)</p>
          </TabsContent>

          <TabsContent value="monto" className="space-y-4">
            <div>
              <Label htmlFor="customAmount">Monto Primera Persona</Label>
              <Input
                id="customAmount"
                type="number"
                step="0.01"
                min="0"
                max={total}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {customAmount && (
              <Card className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Persona 1:</span>
                    <span className="font-medium">S/ {Number.parseFloat(customAmount || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Persona 2:</span>
                    <span className="font-medium">
                      S/ {(total - Number.parseFloat(customAmount || "0")).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            )}
            <Button className="w-full" onClick={handleSplitByMonto} disabled={!customAmount}>
              Dividir por Monto
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
