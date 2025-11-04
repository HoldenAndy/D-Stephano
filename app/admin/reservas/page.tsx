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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockAPI } from "@/lib/services"
import type { Reservation, Table } from "@/lib/types"
import { toast } from "sonner"
import { Plus, Phone, Users, Clock, CalendarIcon, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function ReservasPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [nombre, setNombre] = useState("")
  const [celular, setCelular] = useState("")
  const [personas, setPersonas] = useState("2")
  const [hora, setHora] = useState("12:00")
  const [preferencias, setPreferencias] = useState("")

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "admin") {
      router.push(`/${currentRole}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRole])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [reservationsData, tablesData] = await Promise.all([mockAPI.getReservations(), mockAPI.getTables()])
    setReservations(reservationsData)
    setTables(tablesData)
  }

  const handleCreateReservation = async () => {
    const [hours, minutes] = hora.split(":")
    const reservationDate = new Date(selectedDate)
    reservationDate.setHours(Number.parseInt(hours), Number.parseInt(minutes))

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      clienteNombre: nombre,
      clienteCelular: celular,
      fecha: reservationDate,
      personas: Number.parseInt(personas),
      preferencias: preferencias || undefined,
      estado: "confirmada",
      createdAt: new Date(),
    }

    await mockAPI.createReservation(newReservation)
    toast.success("Reserva creada exitosamente")
    setDialogOpen(false)
    setNombre("")
    setCelular("")
    setPersonas("2")
    setHora("12:00")
    setPreferencias("")
    loadData()
  }

  const handleAssignTable = async (reservationId: string) => {
    const availableTables = tables.filter((t) => t.estado === "libre")
    if (availableTables.length === 0) {
      toast.error("No hay mesas disponibles")
      return
    }

    const reservation = reservations.find((r) => r.id === reservationId)
    if (!reservation) return

    // Find suitable table based on party size
    const suitableTable = availableTables.find((t) => t.capacidad >= reservation.personas) || availableTables[0]

    await mockAPI.updateReservation(reservationId, {
      mesaAsignada: suitableTable.numero,
      estado: "completada",
    })

    await mockAPI.updateTable(suitableTable.id, { estado: "ocupada" })

    toast.success(`Mesa ${suitableTable.numero} asignada`)
    loadData()
  }

  const handleCancelReservation = async (reservationId: string) => {
    if (confirm("¿Estás seguro de cancelar esta reserva?")) {
      await mockAPI.updateReservation(reservationId, { estado: "caducada" })
      toast.success("Reserva cancelada")
      loadData()
    }
  }

  const getStatusColor = (status: Reservation["estado"]) => {
    switch (status) {
      case "confirmada":
        return "bg-green-500/20 text-green-500 border-green-500/50"
      case "en-espera":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
      case "caducada":
        return "bg-red-500/20 text-red-500 border-red-500/50"
      case "completada":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50"
      default:
        return ""
    }
  }

  const getTimeUntil = (fecha: Date) => {
    const now = new Date()
    const diff = new Date(fecha).getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (diff < 0) return "Pasada"
    if (hours > 24) return `${Math.floor(hours / 24)} días`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes} min`
  }

  if (currentRole !== "admin") return null

  const todayReservations = reservations.filter((r) => {
    const resDate = new Date(r.fecha)
    const today = new Date()
    return resDate.toDateString() === today.toDateString()
  })

  return (
    <AppShell title="Gestión de Reservas">
      <div className="space-y-6">
        {/* ... existing stats ... */}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Reservas</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Reserva</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre del Cliente</Label>
                      <Input
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div>
                      <Label htmlFor="celular">Celular</Label>
                      <Input
                        id="celular"
                        value={celular}
                        onChange={(e) => setCelular(e.target.value)}
                        placeholder="987654321"
                      />
                    </div>
                    <div>
                      <Label htmlFor="personas">Número de Personas</Label>
                      <Input
                        id="personas"
                        type="number"
                        min="1"
                        max="12"
                        value={personas}
                        onChange={(e) => setPersonas(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hora">Hora</Label>
                      <Input id="hora" type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="preferencias">Preferencias (Opcional)</Label>
                      <Input
                        id="preferencias"
                        value={preferencias}
                        onChange={(e) => setPreferencias(e.target.value)}
                        placeholder="Cerca de la ventana"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Fecha</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </ScrollArea>
              <Button className="w-full mt-4" onClick={handleCreateReservation}>
                Crear Reserva
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reservations List */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No hay reservas</p>
            ) : (
              <div className="space-y-3">
                {reservations
                  .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                  .map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium">{reservation.clienteNombre}</p>
                          <Badge className={`border ${getStatusColor(reservation.estado)}`}>{reservation.estado}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(reservation.fecha), "PPP", { locale: es })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(reservation.fecha), "HH:mm")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {reservation.personas} personas
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {reservation.clienteCelular}
                          </span>
                        </div>
                        {reservation.preferencias && (
                          <p className="text-sm text-muted-foreground mt-1 italic">{reservation.preferencias}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-sm font-medium">{getTimeUntil(reservation.fecha)}</p>
                          {reservation.mesaAsignada && (
                            <p className="text-xs text-muted-foreground">Mesa #{reservation.mesaAsignada}</p>
                          )}
                        </div>
                        {reservation.estado === "confirmada" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent"
                              onClick={() => handleAssignTable(reservation.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Asignar Mesa
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-transparent"
                              onClick={() => handleCancelReservation(reservation.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
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
