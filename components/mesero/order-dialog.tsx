"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Minus, Send, ShoppingCart } from "lucide-react"
import type { MenuItem, Table } from "@/lib/types"
import { toast } from "sonner"

interface OrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table | null
  menu: MenuItem[]
  onSubmitOrder: (items: any[]) => void
}

const CATEGORIES = ["Ceviches", "Entradas", "Arroces", "Frituras", "Bebidas", "Postres"]

export function OrderDialog({ open, onOpenChange, table, menu, onSubmitOrder }: OrderDialogProps) {
  const [comensales, setComensales] = useState("2")
  const [cart, setCart] = useState<
    Array<{
      item: MenuItem
      cantidad: number
      notas: string
      modificadores: string[]
    }>
  >([])
  const [selectedCategory, setSelectedCategory] = useState("Ceviches")
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({})

  const addToCart = (item: MenuItem) => {
    const notes = itemNotes[item.id] || ""
    const existing = cart.find((c) => c.item.id === item.id && c.notas === notes)
    if (existing) {
      setCart(cart.map((c) => (c.item.id === item.id && c.notas === notes ? { ...c, cantidad: c.cantidad + 1 } : c)))
    } else {
      setCart([...cart, { item, cantidad: 1, notas: notes, modificadores: [] }])
    }
    setItemNotes({ ...itemNotes, [item.id]: "" })
    toast.success(`${item.nombre} agregado`)
  }

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart]
    newCart[index].cantidad += delta
    if (newCart[index].cantidad <= 0) {
      newCart.splice(index, 1)
    }
    setCart(newCart)
  }

  const updateNotes = (index: number, notes: string) => {
    const newCart = [...cart]
    newCart[index].notas = notes
    setCart(newCart)
  }

  const handleSubmit = () => {
    if (cart.length === 0) {
      toast.error("Agrega al menos un plato")
      return
    }
    onSubmitOrder(cart)
    setCart([])
    setComensales("2")
    setItemNotes({})
    onOpenChange(false)
    toast.success("Pedido enviado a cocina")
  }

  const total = cart.reduce((sum, c) => sum + c.item.precioSalon * c.cantidad, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[90vh] w-full p-4 sm:p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg sm:text-xl leading-tight">
            Pedido - Mesa #{table?.numero} | {comensales} comensales
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 h-[calc(90vh-120px)] sm:h-[calc(90vh-140px)]">
          <div className="lg:col-span-3 flex flex-col">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
              <ScrollArea className="w-full mb-3 sm:mb-4">
                <TabsList className="inline-flex lg:grid lg:grid-cols-6 w-full min-w-max lg:min-w-0 h-auto">
                  {CATEGORIES.map((cat) => (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      className="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>

              {CATEGORIES.map((cat) => (
                <TabsContent key={cat} value={cat} className="mt-0 flex-1">
                  <ScrollArea className="h-[calc(90vh-280px)] sm:h-[calc(90vh-300px)] lg:h-[calc(90vh-240px)] pr-2 sm:pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-2 gap-3 sm:gap-4">
                      {menu
                        .filter((item) => item.categoria === cat && item.disponible)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="border rounded-lg p-3 sm:p-4 hover:border-primary transition-colors bg-card"
                          >
                            <div className="flex justify-between items-start gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm sm:text-base mb-1 leading-tight">{item.nombre}</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                  {item.descripcion}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {item.etiquetas.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-base sm:text-lg text-primary whitespace-nowrap">
                                  S/ {item.precioSalon.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col xs:flex-row gap-2 mt-3">
                              <Input
                                placeholder="Notas (ej: poco ají)"
                                value={itemNotes[item.id] || ""}
                                onChange={(e) => setItemNotes({ ...itemNotes, [item.id]: e.target.value })}
                                className="text-xs sm:text-sm h-9 flex-1"
                              />
                              <Button size="sm" onClick={() => addToCart(item)} className="shrink-0 h-9 px-3">
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                <span className="hidden xs:inline">Agregar</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          <div className="lg:col-span-2 border rounded-lg p-4 sm:p-5 flex flex-col bg-card">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h3 className="font-semibold text-base sm:text-lg">Pedido ({cart.length})</h3>
            </div>

            <div className="mb-4">
              <Label htmlFor="comensales" className="text-xs sm:text-sm font-medium">
                Número de Comensales
              </Label>
              <Input
                id="comensales"
                type="number"
                min="1"
                max="12"
                value={comensales}
                onChange={(e) => setComensales(e.target.value)}
                className="mt-1.5 h-10"
              />
            </div>

            <ScrollArea className="flex-1 mb-4 pr-2 min-h-[200px]">
              {cart.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Carrito vacío</p>
                  <p className="text-xs text-muted-foreground mt-1">Agrega platos del menú</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((c, index) => (
                    <div key={index} className="border rounded-lg p-3 sm:p-4 bg-background">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm leading-tight">{c.item.nombre}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                            S/ {c.item.precioSalon.toFixed(2)} c/u
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                          S/ {(c.item.precioSalon * c.cantidad).toFixed(2)}
                        </p>
                      </div>
                      {c.notas && (
                        <div className="mb-2">
                          <Input
                            value={c.notas}
                            onChange={(e) => updateNotes(index, e.target.value)}
                            placeholder="Notas"
                            className="text-[10px] sm:text-xs h-7 sm:h-8"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(index, -1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs sm:text-sm font-medium w-8 sm:w-10 text-center">{c.cantidad}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(index, 1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="border-t pt-3 sm:pt-4 space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">S/ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">IGV (18%)</span>
                <span className="font-medium">S/ {(total * 0.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">S/ {(total * 1.18).toFixed(2)}</span>
              </div>
              <Button
                className="w-full h-10 sm:h-11 text-sm sm:text-base"
                onClick={handleSubmit}
                disabled={cart.length === 0}
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Enviar a Cocina
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
