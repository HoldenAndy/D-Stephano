"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Phone, Users, Clock, X } from "lucide-react"
import type { WaitlistEntry, Table } from "@/lib/types"
import { toast } from "sonner"

interface WaitlistPanelProps {
  entries: WaitlistEntry[]
  tables: Table[]
  onAddEntry: (entry: Omit<WaitlistEntry, "id" | "createdAt" | "notificado">) => void
  onNotify: (id: string) => void
  onAssignTable: (entryId: string, tableId: string) => void
  onRemove: (id: string) => void
}

export function WaitlistPanel({ entries, tables, onAddEntry, onNotify, onAssignTable, onRemove }: WaitlistPanelProps) {
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [celular, setCelular] = useState("")
  const [personas, setPersonas] = useState("2")
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddEntry({
      clienteNombre: nombre,
      clienteCelular: celular,
      personas: Number.parseInt(personas),
      tiempoEstimado: 15,
    })
    setNombre("")
    setCelular("")
    setPersonas("2")
    setOpen(false)
    toast.success("Cliente agregado a la lista de espera")
  }

  const handleAssignTable = () => {
    if (!selectedEntry || !selectedTableId) return
    onAssignTable(selectedEntry.id, selectedTableId)
    setAssignDialogOpen(false)
    setSelectedEntry(null)
    setSelectedTableId("")
  }

  const getTimeWaiting = (createdAt: Date) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
    return `${minutes} min`
  }

  const availableTables = tables.filter((t) => t.estado === "libre" || t.estado === "limpieza")

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Lista de Espera</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar a Lista de Espera</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre del Cliente</Label>
                    <Input
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                      placeholder="987654321"
                      required
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
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Agregar a Lista
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay clientes en espera</p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg font-bold">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{entry.clienteNombre}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {entry.clienteCelular}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {entry.personas}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeWaiting(entry.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedEntry(entry)
                        setAssignDialogOpen(true)
                      }}
                    >
                      Asignar Mesa
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onNotify(entry.id)}>
                      Notificar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onRemove(entry.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar Mesa - {selectedEntry?.clienteNombre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="table">Seleccionar Mesa</Label>
              <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                <SelectTrigger id="table" className="mt-1">
                  <SelectValue placeholder="Selecciona una mesa" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Mesa #{table.numero} - {table.capacidad} personas ({table.estado})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableTables.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">No hay mesas disponibles</p>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAssignTable} disabled={!selectedTableId} className="flex-1">
                Asignar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
