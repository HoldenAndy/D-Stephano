"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import type { User, UserRole } from "@/lib/types"
import { toast } from "sonner"
import { Plus, Edit, Trash2, Users, Shield } from "lucide-react"

const ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "mesero", label: "Mesero" },
  { value: "cocina", label: "Cocina" },
  { value: "caja", label: "Caja" },
  { value: "inventario", label: "Inventario" },
  { value: "reservas", label: "Reservas" },
  { value: "carta", label: "Carta" },
  { value: "crm", label: "CRM" },
  { value: "delivery", label: "Delivery" },
]

export default function UsuariosPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const { users, addUser, updateUser, deleteUser, loadData } = useStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [nombre, setNombre] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([])

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "admin") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  useEffect(() => {
    loadData()
    const usersData = users.map((u) => ({
      ...u,
      roles: u.roles || (u.rol ? [u.rol] : []),
    }))
    if (JSON.stringify(usersData) !== JSON.stringify(users)) {
      usersData.forEach((u) => {
        if (u.id && (!u.roles || u.roles.length === 0)) {
          updateUser(u.id, { roles: u.rol ? [u.rol] : [] })
        }
      })
    }
  }, [loadData])

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setNombre(user.nombre)
      setUsername(user.username)
      setPassword("")
      setSelectedRoles(user.roles || [])
    } else {
      setEditingUser(null)
      setNombre("")
      setUsername("")
      setPassword("")
      setSelectedRoles([])
    }
    setDialogOpen(true)
  }

  const handleSaveUser = () => {
    if (!nombre || !username || (!editingUser && !password)) {
      toast.error("Completa todos los campos requeridos")
      return
    }

    if (selectedRoles.length === 0) {
      toast.error("Selecciona al menos un rol")
      return
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        nombre,
        username,
        ...(password && { password }),
        roles: selectedRoles,
      })
      toast.success("Usuario actualizado")
    } else {
      addUser({
        nombre,
        username,
        password,
        roles: selectedRoles,
      })
      toast.success("Usuario creado")
    }

    setDialogOpen(false)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      deleteUser(userId)
      toast.success("Usuario eliminado")
    }
  }

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  if (currentRole !== "admin") return null

  return (
    <AppShell title="Gestión de Usuarios y Roles">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Administradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{users.filter((u) => (u.roles || []).includes("admin")).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Roles Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ROLES.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Usuarios del Sistema</h2>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Users List */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{user.nombre}</p>
                      <Badge variant="outline" className="text-xs">
                        @{user.username}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(user.roles || []).map((role) => (
                        <Badge key={role} className="text-xs">
                          {ROLES.find((r) => r.value === role)?.label || role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleOpenDialog(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="jperez"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña {editingUser && "(dejar vacío para mantener)"}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editingUser ? "••••••••" : "Contraseña"}
                />
              </div>
              <div>
                <Label className="mb-3 block">Roles del Usuario</Label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((role) => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={role.value}
                        checked={selectedRoles.includes(role.value)}
                        onCheckedChange={() => toggleRole(role.value)}
                      />
                      <label
                        htmlFor={role.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {role.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={handleSaveUser}>
                {editingUser ? "Actualizar Usuario" : "Crear Usuario"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
