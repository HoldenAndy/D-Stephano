"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import { TableGrid } from "@/components/mesero/table-grid"
import { WaitlistPanel } from "@/components/mesero/waitlist-panel"
import { OrderDialog } from "@/components/mesero/order-dialog"
import { SplitBillDialog } from "@/components/mesero/split-bill-dialog"
import { TableStatusDialog } from "@/components/mesero/table-status-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { Star } from "lucide-react"
import { mockAPI } from "@/lib/services"
import type { Table, MenuItem, WaitlistEntry, Order } from "@/lib/types"
import { toast } from "sonner"

export default function MeseroPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const [tables, setTables] = useState<Table[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [splitDialogOpen, setSplitDialogOpen] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [notifications, setNotifications] = useState(2)

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "mesero") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [tablesData, menuData] = await Promise.all([mockAPI.getTables(), mockAPI.getMenu()])
    setTables(tablesData)
    setMenu(menuData)
  }

  const handleTableClick = (table: Table) => {
    setSelectedTable(table)
    if (table.estado === "libre") {
      setOrderDialogOpen(true)
    } else {
      setStatusDialogOpen(true)
    }
  }

  const handleUpdateTableStatus = async (tableId: string, status: Table["estado"]) => {
    await mockAPI.updateTable(tableId, { estado: status })
    loadData()
  }

  const handleSubmitOrder = async (items: any[]) => {
    if (!selectedTable) return

    await mockAPI.updateTable(selectedTable.id, {
      estado: "ocupada",
      comensales: 2,
    })

    const subtotal = items.reduce((sum, item) => sum + item.item.precioSalon * item.cantidad, 0)
    const order: Order = {
      id: `ord-${Date.now()}`,
      tipo: "mesa",
      mesaId: selectedTable.id,
      items: items.map((item) => ({
        id: `item-${Date.now()}-${Math.random()}`,
        menuItemId: item.item.id,
        cantidad: item.cantidad,
        modificadores: item.modificadores,
        notas: item.notas,
        estacion: item.item.estacion,
        estado: "nuevo",
      })),
      subtotal,
      igv: subtotal * 0.18,
      propina: 0,
      total: subtotal * 1.18,
      estado: "nuevo",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await mockAPI.createOrder(order)
    loadData()
  }

  const handleAddToWaitlist = (entry: Omit<WaitlistEntry, "id" | "createdAt" | "notificado">) => {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: `wait-${Date.now()}`,
      createdAt: new Date(),
      notificado: false,
    }
    setWaitlist([...waitlist, newEntry])
  }

  const handleNotifyWaitlist = (id: string) => {
    toast.success("Cliente notificado por WhatsApp")
    setWaitlist(waitlist.map((e) => (e.id === id ? { ...e, notificado: true } : e)))
  }

  const handleAssignTable = async (entryId: string, tableId: string) => {
    const entry = waitlist.find((e) => e.id === entryId)
    if (!entry) return

    await mockAPI.updateTable(tableId, {
      estado: "ocupada",
      comensales: entry.personas,
    })

    setWaitlist(waitlist.filter((e) => e.id !== entryId))
    toast.success(`Mesa asignada a ${entry.clienteNombre}`)
    loadData()
  }

  const handleRemoveFromWaitlist = (id: string) => {
    setWaitlist(waitlist.filter((e) => e.id !== id))
    toast.success("Cliente removido de la lista de espera")
  }

  if (currentRole !== "mesero") return null

  const ocupadas = tables.filter((t) => t.estado === "ocupada").length
  const libres = tables.filter((t) => t.estado === "libre").length

  return (
    <AppShell
      title="Salón y Mesas"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/feedback")} className="bg-transparent">
            <Star className="h-4 w-4 mr-2" />
            Feedback
          </Button>
          <Button variant="outline" size="sm" className="relative bg-transparent">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {notifications}
              </Badge>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Mesas Ocupadas</p>
            <p className="text-2xl font-bold">
              {ocupadas} / {tables.length}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Mesas Libres</p>
            <p className="text-2xl font-bold">{libres}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">En Espera</p>
            <p className="text-2xl font-bold">{waitlist.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Ocupación</p>
            <p className="text-2xl font-bold">{Math.round((ocupadas / tables.length) * 100)}%</p>
          </div>
        </div>

        <WaitlistPanel
          entries={waitlist}
          tables={tables}
          onAddEntry={handleAddToWaitlist}
          onNotify={handleNotifyWaitlist}
          onAssignTable={handleAssignTable}
          onRemove={handleRemoveFromWaitlist}
        />

        <div>
          <h2 className="text-xl font-semibold mb-4">Plano de Mesas</h2>
          <TableGrid tables={tables} onTableClick={handleTableClick} />
        </div>
      </div>

      <OrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        table={selectedTable}
        menu={menu}
        onSubmitOrder={handleSubmitOrder}
      />

      <SplitBillDialog
        open={splitDialogOpen}
        onOpenChange={setSplitDialogOpen}
        order={currentOrder}
        onConfirm={(splits) => {
          console.log("Splits:", splits)
          setSplitDialogOpen(false)
        }}
      />

      <TableStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        table={selectedTable}
        onUpdateStatus={handleUpdateTableStatus}
      />
    </AppShell>
  )
}
