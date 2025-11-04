"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Save, RotateCcw, AlertCircle } from "lucide-react"

export default function ConfiguracionPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const [nombreLocal, setNombreLocal] = useState("D'Stephano")
  const [horaApertura, setHoraApertura] = useState("11:00")
  const [horaCierre, setHoraCierre] = useState("17:00")
  const [igv, setIgv] = useState("18")
  const [propinaSugerida, setPropinaSugerida] = useState("10")
  const [tiempoMesa, setTiempoMesa] = useState("45")
  const [holdReserva, setHoldReserva] = useState("15")

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "admin") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  const handleSave = () => {
    toast.success("Configuración guardada exitosamente")
  }

  const handleResetDemo = () => {
    localStorage.clear()
    toast.success("Datos demo reiniciados")
    setTimeout(() => {
      window.location.href = "/"
    }, 1000)
  }

  if (currentRole !== "admin") return null

  return (
    <AppShell title="Configuración del Sistema">
      <div className="space-y-6">
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="operaciones">Operaciones</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Información del Local</CardTitle>
                <CardDescription>Datos básicos del restaurante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nombreLocal">Nombre del Local</Label>
                  <Input id="nombreLocal" value={nombreLocal} onChange={(e) => setNombreLocal(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horaApertura">Hora de Apertura</Label>
                    <Input
                      id="horaApertura"
                      type="time"
                      value={horaApertura}
                      onChange={(e) => setHoraApertura(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horaCierre">Hora de Cierre</Label>
                    <Input
                      id="horaCierre"
                      type="time"
                      value={horaCierre}
                      onChange={(e) => setHoraCierre(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="igv">IGV (%)</Label>
                  <Input id="igv" type="number" value={igv} onChange={(e) => setIgv(e.target.value)} disabled />
                  <p className="text-xs text-muted-foreground mt-1">Solo informativo - No editable</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comprobantes</CardTitle>
                <CardDescription>Configuración de facturación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="serieBoleta">Serie Boleta</Label>
                  <Input id="serieBoleta" value="B001" disabled />
                </div>
                <div>
                  <Label htmlFor="serieFactura">Serie Factura</Label>
                  <Input id="serieFactura" value="F001" disabled />
                </div>
                <p className="text-sm text-muted-foreground">Integración SUNAT simulada - Solo para demostración</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operaciones" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Operaciones</CardTitle>
                <CardDescription>Parámetros operativos del restaurante</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="propinaSugerida">Propina Sugerida (%)</Label>
                  <Input
                    id="propinaSugerida"
                    type="number"
                    value={propinaSugerida}
                    onChange={(e) => setPropinaSugerida(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="tiempoMesa">Tiempo Estándar por Mesa (min)</Label>
                  <Input
                    id="tiempoMesa"
                    type="number"
                    value={tiempoMesa}
                    onChange={(e) => setTiempoMesa(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="holdReserva">Hold de Reserva (min)</Label>
                  <Input
                    id="holdReserva"
                    type="number"
                    value={holdReserva}
                    onChange={(e) => setHoldReserva(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Tiempo de espera antes de liberar una reserva</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estaciones de Cocina</CardTitle>
                <CardDescription>Configurar estaciones y asignaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Frío/Cevichería", "Plancha", "Fritura", "Parrilla", "Postres", "Barra"].map((estacion) => (
                    <div key={estacion} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{estacion}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impresoras</CardTitle>
                <CardDescription>Configuración de impresoras de cocina</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Impresora Cocina Principal</p>
                      <p className="text-sm text-muted-foreground">Simulada - Mock</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Impresora Barra</p>
                      <p className="text-sm text-muted-foreground">Simulada - Mock</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sistema" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias del Sistema</CardTitle>
                <CardDescription>Configuración general de la aplicación</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Oscuro</Label>
                    <p className="text-sm text-muted-foreground">Tema oscuro para vistas operativas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones de Sonido</Label>
                    <p className="text-sm text-muted-foreground">Alertas sonoras para nuevos pedidos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-refresh KDS</Label>
                    <p className="text-sm text-muted-foreground">Actualización automática cada 5 segundos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-500">
                  <AlertCircle className="h-5 w-5" />
                  Zona de Peligro
                </CardTitle>
                <CardDescription>Acciones irreversibles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Reiniciar Datos Demo</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Esto eliminará todos los datos y restaurará la configuración inicial de demostración.
                    </p>
                    <Button variant="destructive" onClick={handleResetDemo}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reiniciar Demo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
