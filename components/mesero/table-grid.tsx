"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Table } from "@/lib/types"
import { Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TableGridProps {
  tables: Table[]
  onTableClick: (table: Table) => void
}

const STATUS_CONFIG = {
  libre: { label: "Libre", color: "bg-green-500/20 text-green-500 border-green-500/50" },
  ocupada: { label: "Ocupada", color: "bg-blue-500/20 text-blue-500 border-blue-500/50" },
  reservada: { label: "Reservada", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" },
  limpieza: { label: "Limpieza", color: "bg-orange-500/20 text-orange-500 border-orange-500/50" },
  espera: { label: "Espera", color: "bg-purple-500/20 text-purple-500 border-purple-500/50" },
}

export function TableGrid({ tables, onTableClick }: TableGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {tables.map((table) => {
        const status = STATUS_CONFIG[table.estado]
        return (
          <Card
            key={table.id}
            className={cn(
              "p-6 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden",
              table.estado === "libre" && "hover:border-green-500",
              table.estado === "ocupada" && "hover:border-blue-500",
            )}
            onClick={() => onTableClick(table)}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="text-3xl font-bold">#{table.numero}</div>

              <Badge className={cn("border", status.color)}>{status.label}</Badge>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>
                  {table.comensales || 0} / {table.capacidad}
                </span>
              </div>

              {table.estado === "ocupada" && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>45 min</span>
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
