"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function FeedbackPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const { addFeedback } = useStore()
  const [satisfaccion, setSatisfaccion] = useState<number | null>(null)
  const [recomendacion, setRecomendacion] = useState<number | null>(null)
  const [comentario, setComentario] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    }
  }, [currentRole, router])

  const handleSubmit = async () => {
    if (satisfaccion === null || recomendacion === null || comentario.trim() === "") {
      toast.error("Por favor completa todas las preguntas")
      return
    }

    setIsSubmitting(true)
    try {
      addFeedback({
        satisfaccion,
        recomendacion,
        comentario,
        rol: currentRole || "cliente",
      })

      toast.success("¡Gracias por tu feedback! Tu opinión nos ayuda a mejorar.")

      setTimeout(() => {
        router.push(`/${currentRole || "cliente"}`)
      }, 2000)
    } catch (error) {
      toast.error("Error al enviar el feedback")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">D'Stephano</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="bg-linear-to-r from-blue-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="text-3xl">Cuéntanos tu Experiencia</CardTitle>
            <p className="text-blue-100 mt-2">Tu opinión es muy importante para nosotros</p>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Pregunta 1: Satisfacción */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  1. ¿Qué tan satisfactorio estás con el sistema en general?
                </h3>
                <p className="text-sm text-gray-600 mb-4">Califica del 1 al 10</p>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setSatisfaccion(num)}
                    className={`
                      h-12 rounded-lg font-semibold text-sm transition-all duration-200
                      ${
                        satisfaccion === num
                          ? "bg-blue-600 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
              {satisfaccion && <p className="text-sm text-blue-600 font-medium">Seleccionaste: {satisfaccion}/10</p>}
            </div>

            {/* Pregunta 2: Recomendación */}
            <div className="space-y-4 pt-6 border-t">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2. ¿Qué tanto recomendarías el sistema?</h3>
                <p className="text-sm text-gray-600 mb-4">Califica del 1 al 10</p>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setRecomendacion(num)}
                    className={`
                      h-12 rounded-lg font-semibold text-sm transition-all duration-200
                      ${
                        recomendacion === num
                          ? "bg-teal-600 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
              {recomendacion && <p className="text-sm text-teal-600 font-medium">Seleccionaste: {recomendacion}/10</p>}
            </div>

            {/* Pregunta 3: Comentario */}
            <div className="space-y-4 pt-6 border-t">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  3. Escríbenos un comentario que nos ayude a mejorar
                </h3>
                <p className="text-sm text-gray-600 mb-4">Comparte tus sugerencias, comentarios o experiencias</p>
              </div>
              <Textarea
                placeholder="Escribe tu comentario aquí..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="min-h-32 resize-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">{comentario.length} caracteres</p>
            </div>

            {/* Botón Enviar */}
            <div className="pt-6 border-t flex gap-3">
              <Button variant="outline" onClick={() => router.back()} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || satisfaccion === null || recomendacion === null || comentario.trim() === ""}
                className="flex-1 bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                {isSubmitting ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Tu feedback es confidencial y nos ayuda a mejorar continuamente</p>
          <p className="mt-2">Gracias por ser parte de D'Stephano</p>
        </div>
      </main>
    </div>
  )
}
