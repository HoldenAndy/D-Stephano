"use client"

import { useEffect } from "react" // <-- 1. RESTAURADO
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store" // <-- 2. RESTAURADO
import { AppShell } from "@/components/layout/app-shell"
import { Users, UtensilsCrossed, Package, BarChart3, Settings, Calendar } from "lucide-react"

// ¡IMPORTAMOS NUESTROS COMPONENTES DEL UI KIT!
import { NavCard } from "@/components/NavCard"
import { StatCard } from "@/components/StatCard"

const ADMIN_SECTIONS = [
  // ... (tu lista de secciones sigue igual)
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
  const { currentRole } = useAuthStore() // <-- 3. RESTAURADO

  // <-- 4. RESTAURADO (Este es el "guardia" que SÍ queremos)
  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "admin") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  // <-- 5. RESTAURADO (La segunda parte del "guardia")
  if (currentRole !== "admin") return null

  return (
    <AppShell title="Panel de Administración" hideBackButton={true}>
      
      {/* (USAMOS EL NavCard - Esto ya estaba bien) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_SECTIONS.map((section) => (
          <NavCard
            key={section.id}
            title={section.title}
            description={section.description}
            icon={section.icon}
            onClick={() => router.push(section.href)}
          />
        ))}
      </div>

      {/* 6. <-- ¡RUTAS ARREGLADAS! */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Ventas Hoy"
          value="S/ 2,450"
          description="+12% vs ayer"
          href="/admin/reportes" // (Esta estaba bien)
        />
        <StatCard
          title="Mesas Activas"
          value="5 / 8"
          description="62.5% ocupación"
          href="/admin/reportes" // <-- ARREGLADO (Un admin ve reportes)
        />
        <StatCard
          title="Pedidos Pendientes"
          value="3"
          description="En cocina"
          href="/admin/reportes" // <-- ARREGLADO (Un admin ve reportes)
        />
      </div>

    </AppShell>
  )
}