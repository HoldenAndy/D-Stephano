import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

// Definición de las props para una tarjeta de display (solo lectura)
interface ReportDisplayCardProps {
  title: string
  value: string | ReactNode
  description: string | ReactNode
  icon?: ReactNode // Mantengo el ícono si lo necesitas
}

/**
 * @description Tarjeta de visualización de métricas. Diseñada intencionalmente
 * para NO ser interactiva. Soluciona el problema de "Clics Falsos" (P2)
 * detectado en Hotjar, al eliminar la affordance de botón/enlace.
 * No tiene hover, ni sombra, ni enlace.
 */
export function ReportDisplayCard({
  title,
  value,
  description,
  icon,
}: ReportDisplayCardProps) {
  return (
    // NOTA CLAVE: Eliminamos el 'hover:...' y reducimos la sombra/borde.
    // Usamos la Card base de shadcn/ui pero sin estilos interactivos.
    <Card className="bg-white rounded-lg border-gray-100 border-2"> 
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">
          {title}
        </CardTitle>
        {icon && <div className="text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}