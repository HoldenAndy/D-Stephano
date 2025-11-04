"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockAPI } from "@/lib/services"
import type { MenuItem, KitchenStation } from "@/lib/types"
import { toast } from "sonner"
import { Plus, Edit, Trash2 } from "lucide-react"

const CATEGORIES = ["Ceviches", "Entradas", "Arroces", "Frituras", "Bebidas", "Postres"]
const STATIONS: KitchenStation[] = ["frio", "plancha", "fritura", "parrilla", "postres", "barra"]

export default function CartaPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("Ceviches")
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precioSalon, setPrecioSalon] = useState("")
  const [precioDelivery, setPrecioDelivery] = useState("")
  const [categoria, setCategoria] = useState("Ceviches")
  const [estacion, setEstacion] = useState<KitchenStation>("frio")

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "admin") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  useEffect(() => {
    loadMenu()
  }, [])

  const loadMenu = async () => {
    const menuData = await mockAPI.getMenu()
    setMenu(menuData)
  }

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setNombre(item.nombre)
      setDescripcion(item.descripcion || "")
      setPrecioSalon(item.precioSalon.toString())
      setPrecioDelivery(item.precioDelivery.toString())
      setCategoria(item.categoria)
      setEstacion(item.estacion)
    } else {
      setEditingItem(null)
      setNombre("")
      setDescripcion("")
      setPrecioSalon("")
      setPrecioDelivery("")
      setCategoria("Ceviches")
      setEstacion("frio")
    }
    setDialogOpen(true)
  }

  const handleCreateItem = async () => {
    if (editingItem) {
      const updatedMenu = menu.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              nombre,
              categoria,
              precioSalon: Number.parseFloat(precioSalon),
              precioDelivery: Number.parseFloat(precioDelivery),
              descripcion,
              estacion,
            }
          : item,
      )
      localStorage.setItem("dstephano-menu", JSON.stringify(updatedMenu))
      toast.success("Plato actualizado")
    } else {
      const newItem: MenuItem = {
        id: `m-${Date.now()}`,
        nombre,
        categoria,
        precioSalon: Number.parseFloat(precioSalon),
        precioDelivery: Number.parseFloat(precioDelivery),
        descripcion,
        etiquetas: [],
        disponible: true,
        estacion,
      }

      const updatedMenu = [...menu, newItem]
      localStorage.setItem("dstephano-menu", JSON.stringify(updatedMenu))
      toast.success("Plato agregado a la carta")
    }

    setDialogOpen(false)
    setEditingItem(null)
    loadMenu()
  }

  const handleDeleteItem = async (itemId: string) => {
    if (confirm("¿Estás seguro de eliminar este plato?")) {
      const updatedMenu = menu.filter((item) => item.id !== itemId)
      localStorage.setItem("dstephano-menu", JSON.stringify(updatedMenu))
      toast.success("Plato eliminado")
      loadMenu()
    }
  }

  const handleToggleAvailability = async (itemId: string, disponible: boolean) => {
    await mockAPI.updateMenuItem(itemId, { disponible })
    toast.success(disponible ? "Plato activado" : "Plato marcado como agotado")
    loadMenu()
  }

  if (currentRole !== "admin") return null

  const filteredMenu = menu.filter((item) => item.categoria === selectedCategory)
  const disponibles = menu.filter((m) => m.disponible).length
  const agotados = menu.filter((m) => !m.disponible).length

  return (
    <AppShell title="Gestión de Carta">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Platos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{menu.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{disponibles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Agotados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{agotados}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{CATEGORIES.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Plato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Editar Plato" : "Agregar Plato a la Carta"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Plato</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ceviche Clásico"
                  />
                </div>
                <div>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Pescado del día, limón, cebolla morada..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select value={categoria} onValueChange={setCategoria}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estacion">Estación de Cocina</Label>
                    <Select value={estacion} onValueChange={(v) => setEstacion(v as KitchenStation)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATIONS.map((station) => (
                          <SelectItem key={station} value={station}>
                            {station}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="precioSalon">Precio Salón (S/)</Label>
                    <Input
                      id="precioSalon"
                      type="number"
                      step="0.01"
                      value={precioSalon}
                      onChange={(e) => setPrecioSalon(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="precioDelivery">Precio Delivery (S/)</Label>
                    <Input
                      id="precioDelivery"
                      type="number"
                      step="0.01"
                      value={precioDelivery}
                      onChange={(e) => setPrecioDelivery(e.target.value)}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreateItem}>
                  {editingItem ? "Actualizar Plato" : "Agregar Plato"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Menu Items */}
        <Card>
          <CardHeader>
            <CardTitle>{selectedCategory}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMenu.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No hay platos en esta categoría</p>
            ) : (
              <div className="space-y-3">
                {filteredMenu.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium">{item.nombre}</p>
                        {!item.disponible && (
                          <Badge className="bg-red-500/20 text-red-500 border-red-500/50 border">Agotado</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {item.estacion}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.descripcion}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Salón: S/ {item.precioSalon.toFixed(2)}</span>
                        <span>Delivery: S/ {item.precioDelivery.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`switch-${item.id}`} className="text-sm">
                          {item.disponible ? "Disponible" : "Agotado"}
                        </Label>
                        <Switch
                          id={`switch-${item.id}`}
                          checked={item.disponible}
                          onCheckedChange={(checked) => handleToggleAvailability(item.id, checked)}
                        />
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleOpenDialog(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
