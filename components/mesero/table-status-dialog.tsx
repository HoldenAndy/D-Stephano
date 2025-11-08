"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Table } from "@/lib/types"
import { toast } from "sonner"

interface TableStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table | null
  onUpdateStatus: (tableId: string, status: Table["estado"]) => void
}

const STATUS_OPTIONS = [
  { value: "libre", label: "Libre" },
  { value: "ocupada", label: "Ocupada" },
  { value: "reservada", label: "Reservada" },
  { value: "limpieza", label: "En Limpieza" },
  { value: "espera", label: "En Espera" },
] as const

export function TableStatusDialog({ open, onOpenChange, table, onUpdateStatus }: TableStatusDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<Table["estado"]>(table?.estado || "libre")

  const handleSubmit = () => {
    if (!table) return
    onUpdateStatus(table.id, selectedStatus)
    toast.success(`Mesa ${table.numero} actualizada a ${STATUS_OPTIONS.find((s) => s.value === selectedStatus)?.label}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md w-full z-90">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Cambiar Estado - Mesa #{table?.numero}</DialogTitle>
        </DialogHeader>

        <div className="py-4 sm:py-6 min-h-[120px]">
          <div className="space-y-3">
            <Label htmlFor="status" className="text-sm font-medium">
              Nuevo Estado
            </Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Table["estado"])}>
              <SelectTrigger id="status" className="h-11 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent sideOffset={4}>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-sm py-2.5">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto sm:flex-1 h-11">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="w-full sm:w-auto sm:flex-1 h-11">
            Actualizar Estado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
