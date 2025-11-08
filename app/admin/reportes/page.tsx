"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import { ReportDisplayCard } from "@/components/ReportDisplayCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAPI } from "@/lib/services"
import type { Order } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download, TrendingUp, DollarSign, Users, Package } from "lucide-react"

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function ReportesPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])

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

  const loadData = async () => {
    const ordersData = await mockAPI.getOrders()
    setOrders(ordersData)
  }

  if (currentRole !== "admin") return null

  // Mock data for charts
  const ventasPorDia = [
    { dia: "Lun", ventas: 1200 },
    { dia: "Mar", ventas: 1800 },
    { dia: "Mié", ventas: 2100 },
    { dia: "Jue", ventas: 1900 },
    { dia: "Vie", ventas: 2800 },
    { dia: "Sáb", ventas: 3200 },
    { dia: "Dom", ventas: 2900 },
  ]

  const ventasPorCategoria = [
    { name: "Ceviches", value: 35 },
    { name: "Arroces", value: 25 },
    { name: "Frituras", value: 20 },
    { name: "Entradas", value: 12 },
    { name: "Bebidas", value: 5 },
    { name: "Postres", value: 3 },
  ]

  const platosTop = [
    { plato: "Ceviche Clásico", cantidad: 45, ventas: 1575 },
    { plato: "Arroz con Mariscos", cantidad: 38, ventas: 1444 },
    { plato: "Jalea Mixta", cantidad: 32, ventas: 1440 },
    { plato: "Ceviche Mixto", cantidad: 28, ventas: 1176 },
    { plato: "Causa de Pulpo", cantidad: 25, ventas: 700 },
  ]

  const totalVentas = ventasPorDia.reduce((sum, d) => sum + d.ventas, 0)
  const ticketPromedio = totalVentas / 85 // Mock: 85 órdenes

  return (
    <AppShell title="Reportes y Análisis">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ReportDisplayCard
            icon={<DollarSign className="h-5 w-5 text-sky-500" />}
            title="Ventas Semana"
            value={`S/ ${totalVentas.toLocaleString()}`}
            description={<span className="text-green-500">+15% vs semana anterior</span>}
          />
          <ReportDisplayCard
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
            title="Ticket Promedio"
            value={`S/ ${ticketPromedio.toFixed(2)}`}
            description={<span className="text-green-500">+8% vs semana anterior</span>}
          />
          <ReportDisplayCard
            icon={<Users className="h-5 w-5 text-violet-500" />}
            title="Clientes Atendidos"
            value={"85"}
            description={<span className="text-muted-foreground">Esta semana</span>}
          />
          <ReportDisplayCard
            icon={<Package className="h-5 w-5 text-yellow-500" />}
            title="Platos Vendidos"
            value={"168"}
            description={<span className="text-muted-foreground">Esta semana</span>}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ventas">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="ventas">Ventas</TabsTrigger>
              <TabsTrigger value="productos">Productos</TabsTrigger>
              <TabsTrigger value="operaciones">Operaciones</TabsTrigger>
            </TabsList>
            <Button variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          <TabsContent value="ventas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ventas por Día</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ventasPorDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="ventas" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ventasPorCategoria}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                      >
                        {ventasPorCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Canal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Salón</p>
                      <p className="text-sm text-muted-foreground">72 órdenes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">S/ 12,450</p>
                      <p className="text-sm text-muted-foreground">78%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Delivery</p>
                      <p className="text-sm text-muted-foreground">13 órdenes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">S/ 3,550</p>
                      <p className="text-sm text-muted-foreground">22%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="productos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Platos Más Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platosTop.map((plato, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                        <div>
                          <p className="font-medium">{plato.plato}</p>
                          <p className="text-sm text-muted-foreground">{plato.cantidad} unidades vendidas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">S/ {plato.ventas.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total ventas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rotación de Inventario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pescado del día</span>
                      <span className="font-medium">8.5 días</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Limón</span>
                      <span className="font-medium">3.2 días</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cebolla morada</span>
                      <span className="font-medium">5.1 días</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pulpo</span>
                      <span className="font-medium">6.8 días</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mermas Registradas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pescado</span>
                      <span className="font-medium text-red-500">2.5 kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Limón</span>
                      <span className="font-medium text-red-500">1.2 kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Culantro</span>
                      <span className="font-medium text-red-500">0.3 kg</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total Mermas</span>
                        <span className="text-red-500">S/ 125.50</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operaciones" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rotación de Mesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((mesa) => (
                      <div key={mesa} className="flex justify-between items-center">
                        <span className="text-sm">Mesa #{mesa}</span>
                        <div className="text-right">
                          <span className="font-medium">3.2 rotaciones</span>
                          <span className="text-xs text-muted-foreground ml-2">45 min promedio</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance por Mesero</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">Carlos Mesero</p>
                        <p className="text-sm text-muted-foreground">28 pedidos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">S/ 4,250</p>
                        <p className="text-sm text-muted-foreground">Ventas</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">Ana Mesera</p>
                        <p className="text-sm text-muted-foreground">24 pedidos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">S/ 3,890</p>
                        <p className="text-sm text-muted-foreground">Ventas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Satisfacción del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4 text-center">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="p-4 border rounded-lg">
                      <div className="text-3xl font-bold">
                        {stars === 5 ? 45 : stars === 4 ? 28 : stars === 3 ? 8 : stars === 2 ? 2 : 1}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{"⭐".repeat(stars)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Rating Promedio</p>
                  <p className="text-4xl font-bold mt-2">4.6 / 5.0</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
