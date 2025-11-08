// app/page.tsx

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { initializeMockData } from "@/lib/mock-data"
// Quitamos los imports de Card, ya no los necesitamos aquí
import { User, ChefHat, CreditCard, Truck, ShieldCheck, UtensilsCrossed } from "lucide-react"

// 1. <-- ¡IMPORTAMOS NUESTRO NUEVO COMPONENTE DEL UI KIT!
import { RoleCard } from "@/components/RoleCard"

const ROLES = [
  {
    id: "admin",
    nombre: "Administrador",
    descripcion: "Acceso completo al sistema",
    icon: ShieldCheck,
    color: "text-primary",
  },
  {
    id: "mesero",
    nombre: "Mesero",
    descripcion: "Gestión de mesas y pedidos",
    icon: User,
    color: "text-accent",
  },
  {
    id: "cocina",
    nombre: "Cocina",
    descripcion: "Sistema de display de cocina",
    icon: ChefHat,
    color: "text-warning",
  },
  {
    id: "caja",
    nombre: "Caja",
    descripcion: "Punto de venta y cobros",
    icon: CreditCard,
    color: "text-info",
  },
  {
    id: "delivery",
    nombre: "Delivery",
    descripcion: "Gestión de entregas",
    icon: Truck,
    color: "text-success",
  },
  {
    id: "cliente",
    nombre: "Cliente",
    descripcion: "Ver menú y reservar",
    icon: UtensilsCrossed,
    color: "text-muted-foreground",
  },
] as const

export default function LoginPage() {
  const router = useRouter()
  const { setRole, currentRole } = useAuthStore()

  useEffect(() => {
    initializeMockData()

    // Redirect if already logged in
    if (currentRole) {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  const handleRoleSelect = (roleId: string) => {
    setRole(roleId as any)
    router.push(`/${roleId}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section with Ocean Wave */}
      <div className="relative h-[40vh] bg-gradient-to-b from-muted to-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('/ocean-underwater.jpg')] bg-cover bg-center opacity-40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl font-bold mb-4 text-balance">D'Stephano</h1>
          <p className="text-xl text-foreground max-w-2xl text-balance">
            Sistema de gestión integral para restaurante de comida marina
          </p>
        </div>
      </div>

      {/* Role Selection */}
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">Selecciona tu rol para continuar</h2>

          {/* 2. <-- ¡ARREGLAMOS EL PROBLEMA DEL SCROLL! */}
          {/* Cambiamos 'lg:grid-cols-3' por 'lg:grid-cols-2' para que se vean todos. */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            
            {/* 3. <-- ¡USAMOS NUESTRO NUEVO COMPONENTE! */}
            {/* Reemplazamos todo el código de la tarjeta por una sola línea */}
            {ROLES.map((role) => (
              <RoleCard
                key={role.id}
                title={role.nombre}
                description={role.descripcion}
                icon={role.icon}
                color={role.color}
                onClick={() => handleRoleSelect(role.id)}
              />
            ))}
          </div>

          <div className="mt-12 text-center text-sm text-muted-foreground">
            <p>Sistema de demostración - Todos los datos son simulados</p>
            <p className="mt-2">Horario: 11:00 - 17:00 | IGV: 18% | Moneda: PEN (S/)</p>
          </div>
        </div>
      </div>
    </div>
  )
}