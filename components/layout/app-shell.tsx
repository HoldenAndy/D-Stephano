"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, ArrowLeft } from "lucide-react"
import { useState } from "react"

interface AppShellProps {
  children: React.ReactNode
  title: string
  actions?: React.ReactNode
  hideBackButton?: boolean // <-- 1. AÑADIMOS LA NUEVA PROP (OPCIONAL)
}

export function AppShell({ 
  children, 
  title, 
  actions, 
  hideBackButton = false // <-- 2. LA USAMOS AQUÍ (por defecto no se oculta)
}: AppShellProps) {
  const router = useRouter()
  const { currentRole, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* 3. ¡AQUÍ ESTÁ LA MAGIA! (Renderizado condicional) */}
            {/* Si hideBackButton es 'true', este botón no se renderiza */}
            {!hideBackButton && (
              <Button variant="ghost" size="icon" onClick={handleGoBack} title="Volver atrás" className="hover:bg-accent">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}

            <h1 className="text-xl font-semibold">{title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {actions}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">{currentRole?.toUpperCase()}</span>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}