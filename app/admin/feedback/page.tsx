"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useStore } from "@/lib/store"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import type { Feedback, UserRole } from "@/lib/types"
import { Star, MessageSquare, TrendingUp } from "lucide-react"

export default function FeedbackPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const { feedbacks } = useStore()

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "admin") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  if (currentRole !== "admin") return null

  const roles: UserRole[] = ["mesero", "cocina", "caja", "delivery", "cliente"]

  const getFeedbackByRole = (rol: UserRole) => feedbacks.filter((f) => f.rol === rol)

  const getAverageRating = (feedbackList: Feedback[], field: "satisfaccion" | "recomendacion") => {
    if (feedbackList.length === 0) return 0
    const sum = feedbackList.reduce((acc, f) => acc + f[field], 0)
    return (sum / feedbackList.length).toFixed(1)
  }

  const getTotalStats = () => {
    const total = feedbacks.length
    const avgSatisfaccion = getAverageRating(feedbacks, "satisfaccion")
    const avgRecomendacion = getAverageRating(feedbacks, "recomendacion")
    return { total, avgSatisfaccion, avgRecomendacion }
  }

  const stats = getTotalStats()

  return (
    <AppShell title="Análisis de Feedback">
      <div className="space-y-6">
        {/* Stats Generales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Encuestas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Respuestas recibidas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Satisfacción Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">{stats.avgSatisfaccion}</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <= Math.round(Number(stats.avgSatisfaccion) / 2)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">De 10</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recomendación Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">{stats.avgRecomendacion}</div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">De 10</p>
            </CardContent>
          </Card>
        </div>

        {/* Feedback por Rol */}
        <Tabs defaultValue="mesero">
          <TabsList className="grid grid-cols-5 w-full">
            {roles.map((rol) => (
              <TabsTrigger key={rol} value={rol} className="capitalize">
                {rol} ({getFeedbackByRole(rol).length})
              </TabsTrigger>
            ))}
          </TabsList>

          {roles.map((rol) => {
            const rolFeedbacks = getFeedbackByRole(rol)
            const avgSat = getAverageRating(rolFeedbacks, "satisfaccion")
            const avgRec = getAverageRating(rolFeedbacks, "recomendacion")

            return (
              <TabsContent key={rol} value={rol} className="mt-4 space-y-4">
                {/* Stats por Rol */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{avgSat}/10</div>
                      <Progress value={Number(avgSat) * 10} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Recomendación</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{avgRec}/10</div>
                      <Progress value={Number(avgRec) * 10} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>

                {/* Listado de Feedback */}
                {rolFeedbacks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay feedback de {rol} aún</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rolFeedbacks.map((feedback) => (
                      <Card key={feedback.id}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex gap-4">
                                <div>
                                  <p className="text-sm font-medium">Satisfacción: {feedback.satisfaccion}/10</p>
                                  <div className="flex gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i <= Math.round(feedback.satisfaccion / 2)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Recomendación: {feedback.recomendacion}/10</p>
                                  <div className="flex gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i <= Math.round(feedback.recomendacion / 2)
                                            ? "fill-green-400 text-green-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {new Date(feedback.createdAt).toLocaleDateString()}
                              </Badge>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">{feedback.comentario}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </AppShell>
  )
}
