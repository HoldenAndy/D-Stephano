"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, UserPlus, Phone, Mail, MapPin, Calendar, TrendingUp, Star, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import type { Customer } from "@/lib/types"

export default function ClientesPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer, loadData } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "admin") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  useEffect(() => {
    loadData()
  }, [])

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm),
  )

  const getCustomerOrders = (customerId: string) => {
    return orders.filter((o) => o.customerId === customerId)
  }

  const getCustomerStats = (customerId: string) => {
    const customerOrders = getCustomerOrders(customerId)
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0)
    const avgOrder = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0
    const lastVisit =
      customerOrders.length > 0
        ? new Date(Math.max(...customerOrders.map((o) => new Date(o.createdAt).getTime())))
        : null

    return { totalOrders: customerOrders.length, totalSpent, avgOrder, lastVisit }
  }

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
    } else {
      setEditingCustomer(null)
    }
    setIsAddDialogOpen(true)
  }

  const handleAddCustomer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formData.get("name") as string,
        email: (formData.get("email") as string) || undefined,
        phone: (formData.get("phone") as string) || undefined,
        address: (formData.get("address") as string) || undefined,
        preferences: (formData.get("preferences") as string) || undefined,
      })
      toast.success("Cliente actualizado")
    } else {
      addCustomer({
        name: formData.get("name") as string,
        email: (formData.get("email") as string) || undefined,
        phone: (formData.get("phone") as string) || undefined,
        address: (formData.get("address") as string) || undefined,
        preferences: (formData.get("preferences") as string) || undefined,
      })
      toast.success("Cliente agregado")
    }

    setIsAddDialogOpen(false)
    setEditingCustomer(null)
    e.currentTarget.reset()
  }

  const handleDeleteCustomer = (customerId: string) => {
    if (confirm("¿Estás seguro de eliminar este cliente?")) {
      deleteCustomer(customerId)
      toast.success("Cliente eliminado")
      if (selectedCustomer === customerId) {
        setSelectedCustomer(null)
      }
    }
  }

  const selectedCustomerData = selectedCustomer ? customers.find((c) => c.id === selectedCustomer) : null

  const selectedCustomerStats = selectedCustomer ? getCustomerStats(selectedCustomer) : null

  if (currentRole !== "admin") return null

  return (
    <AppShell title="CRM - Clientes">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CRM - Clientes</h1>
            <p className="text-muted-foreground">Gestión de clientes y relaciones</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <UserPlus className="mr-2 h-4 w-4" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCustomer ? "Editar Cliente" : "Agregar Nuevo Cliente"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input id="name" name="name" required defaultValue={editingCustomer?.name} />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+51 999 999 999"
                    defaultValue={editingCustomer?.phone}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={editingCustomer?.email} />
                </div>
                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" name="address" defaultValue={editingCustomer?.address} />
                </div>
                <div>
                  <Label htmlFor="preferences">Preferencias/Notas</Label>
                  <Input
                    id="preferences"
                    name="preferences"
                    placeholder="Alergias, preferencias, etc."
                    defaultValue={editingCustomer?.preferences}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingCustomer ? "Actualizar Cliente" : "Guardar Cliente"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes VIP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  customers.filter((c) => {
                    const stats = getCustomerStats(c.id)
                    return stats.totalSpent > 500
                  }).length
                }
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                S/ {(orders.reduce((sum, o) => sum + o.total, 0) / orders.length || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Nuevos (Mes)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  customers.filter((c) => {
                    const created = new Date(c.createdAt)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  }).length
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredCustomers.map((customer) => {
                    const stats = getCustomerStats(customer.id)
                    const isVIP = stats.totalSpent > 500

                    return (
                      <Card
                        key={customer.id}
                        className={`cursor-pointer transition-colors hover:bg-accent ${
                          selectedCustomer === customer.id ? "border-primary" : ""
                        }`}
                        onClick={() => setSelectedCustomer(customer.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{customer.name}</p>
                                {isVIP && (
                                  <Badge variant="default" className="text-xs">
                                    <Star className="mr-1 h-3 w-3" />
                                    VIP
                                  </Badge>
                                )}
                              </div>
                              {customer.phone && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{stats.totalOrders} pedidos</p>
                              <p className="text-xs text-muted-foreground">S/ {stats.totalSpent.toFixed(2)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Detalles del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCustomerData && selectedCustomerStats ? (
                <Tabs defaultValue="info">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="info">Información</TabsTrigger>
                    <TabsTrigger value="orders">Historial</TabsTrigger>
                    <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold">{selectedCustomerData.name}</h3>
                          {selectedCustomerStats.totalSpent > 500 && (
                            <Badge variant="default" className="mt-2">
                              <Star className="mr-1 h-3 w-3" />
                              Cliente VIP
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenDialog(selectedCustomerData)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCustomer(selectedCustomerData.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {selectedCustomerData.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedCustomerData.phone}</span>
                          </div>
                        )}
                        {selectedCustomerData.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedCustomerData.email}</span>
                          </div>
                        )}
                        {selectedCustomerData.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedCustomerData.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Cliente desde {format(new Date(selectedCustomerData.createdAt), "PP", { locale: es })}
                          </span>
                        </div>
                      </div>

                      {selectedCustomerData.preferences && (
                        <div className="rounded-lg border p-4">
                          <h4 className="font-medium mb-2">Preferencias y Notas</h4>
                          <p className="text-sm text-muted-foreground">{selectedCustomerData.preferences}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="orders">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {getCustomerOrders(selectedCustomer).map((order) => (
                          <Card key={order.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-medium">Pedido #{order.id.slice(0, 8)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(order.createdAt), "PPp", { locale: es })}
                                  </p>
                                </div>
                                <Badge>{order.status}</Badge>
                              </div>
                              <div className="space-y-1">
                                {order.items.map((item, idx) => (
                                  <p key={idx} className="text-sm">
                                    {item.quantity}x {item.name}
                                  </p>
                                ))}
                              </div>
                              <p className="text-right font-bold mt-2">S/ {order.total.toFixed(2)}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="stats" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{selectedCustomerStats.totalOrders}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">S/ {selectedCustomerStats.totalSpent.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">S/ {selectedCustomerStats.avgOrder.toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Última Visita</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm">
                            {selectedCustomerStats.lastVisit
                              ? format(selectedCustomerStats.lastVisit, "PP", { locale: es })
                              : "N/A"}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Platos Favoritos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(
                            getCustomerOrders(selectedCustomer)
                              .flatMap((o) => o.items)
                              .reduce(
                                (acc, item) => {
                                  acc[item.name] = (acc[item.name] || 0) + item.quantity
                                  return acc
                                },
                                {} as Record<string, number>,
                              ),
                          )
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([name, count]) => (
                              <div key={name} className="flex items-center justify-between">
                                <span className="text-sm">{name}</span>
                                <Badge variant="secondary">{count}x</Badge>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                  Selecciona un cliente para ver sus detalles
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
