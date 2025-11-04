"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UtensilsCrossed, Package, BarChart3, Settings, Calendar } from "lucide-react"

const ADMIN_SECTIONS = [
  {
    id: "usuarios",
    title: "Usuarios y Roles",
    description: "Gestionar empleados y permisos",
    icon: Users,
    href: "/admin/usuarios",
  },
  {
    id: "clientes",
    title: "CRM - Clientes",
    description: "Gestión de clientes y relaciones",
    icon: Users,
    href: "/admin/clientes",
  },
  {
    id: "carta",
    title: "Carta y Menú",
    description: "Editar platos, precios y categorías",
    icon: UtensilsCrossed,
    href: "/admin/carta",
  },
  {
    id: "inventario",
    title: "Inventario y Recetas",
    description: "Ingredientes, stock y BOM",
    icon: Package,
    href: "/admin/inventario",
  },
  {
    id: "reportes",
    title: "Reportes",
    description: "Ventas, rotación y KPIs",
    icon: BarChart3,
    href: "/admin/reportes",
  },
  {
    id: "reservas",
    title: "Reservas",
    description: "Gestionar reservaciones",
    icon: Calendar,
    href: "/admin/reservas",
  },
  {
    id: "feedback",
    title: "Feedback de Usuarios",
    description: "Ver encuestas y opiniones",
    icon: BarChart3,
    href: "/admin/feedback",
  },
  {
    id: "configuracion",
    title: "Configuración",
    description: "Ajustes del sistema",
    icon: Settings,
    href: "/admin/configuracion",
  },
]

export default function AdminPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "admin") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  if (currentRole !== "admin") return null

  return (
    <AppShell title="Panel de Administración">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <Card
              key={section.id}
              className="hover:border-primary cursor-pointer transition-all hover:shadow-lg"
              onClick={() => router.push(section.href)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-8 w-8 text-primary" />
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">S/ 2,450</div>
            <p className="text-sm text-muted-foreground mt-1">+12% vs ayer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Mesas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5 / 8</div>
            <p className="text-sm text-muted-foreground mt-1">62.5% ocupación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-sm text-muted-foreground mt-1">En cocina</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
