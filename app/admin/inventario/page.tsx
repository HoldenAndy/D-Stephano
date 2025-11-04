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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockAPI } from "@/lib/services"
import type { Ingredient, Recipe, MenuItem } from "@/lib/types"
import { toast } from "sonner"
import { Plus, AlertTriangle, Package, TrendingDown, Edit, Trash2 } from "lucide-react"

export default function InventarioPage() {
  const router = useRouter()
  const { currentRole } = useAuthStore()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [menu, setMenu] = useState<MenuItem[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [nombre, setNombre] = useState("")
  const [stock, setStock] = useState("")
  const [unidad, setUnidad] = useState("")
  const [minimo, setMinimo] = useState("")
  const [costo, setCosto] = useState("")
  const [selectedMenuItem, setSelectedMenuItem] = useState("")
  const [rendimiento, setRendimiento] = useState("1")
  const [merma, setMerma] = useState("0.05")
  const [recipeIngredients, setRecipeIngredients] = useState<
    { ingredienteId: string; cantidad: number; unidad: string }[]
  >([])

  useEffect(() => {
    if (!currentRole) {
      router.push("/")
    } else if (currentRole !== "admin") {
      router.push(`/${currentRole}`)
    }
  }, [currentRole, router])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [ingredientsData, recipesData, menuData] = await Promise.all([
      mockAPI.getIngredients(),
      mockAPI.getRecipes(),
      mockAPI.getMenu(),
    ])
    setIngredients(ingredientsData)
    setRecipes(recipesData)
    setMenu(menuData)
  }

  const handleOpenIngredientDialog = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient)
      setNombre(ingredient.nombre)
      setStock(ingredient.stock.toString())
      setUnidad(ingredient.unidad)
      setMinimo(ingredient.minimo.toString())
      setCosto(ingredient.costo.toString())
    } else {
      setEditingIngredient(null)
      setNombre("")
      setStock("")
      setUnidad("")
      setMinimo("")
      setCosto("")
    }
    setDialogOpen(true)
  }

  const handleCreateIngredient = async () => {
    if (editingIngredient) {
      const updatedIngredients = ingredients.map((ing) =>
        ing.id === editingIngredient.id
          ? {
              ...ing,
              nombre,
              stock: Number.parseFloat(stock),
              unidad,
              minimo: Number.parseFloat(minimo),
              costo: Number.parseFloat(costo),
            }
          : ing,
      )
      localStorage.setItem("dstephano-ingredients", JSON.stringify(updatedIngredients))
      toast.success("Ingrediente actualizado")
    } else {
      const newIngredient: Ingredient = {
        id: `i-${Date.now()}`,
        nombre,
        stock: Number.parseFloat(stock),
        unidad,
        minimo: Number.parseFloat(minimo),
        costo: Number.parseFloat(costo),
      }

      const updatedIngredients = [...ingredients, newIngredient]
      localStorage.setItem("dstephano-ingredients", JSON.stringify(updatedIngredients))
      toast.success("Ingrediente agregado")
    }

    setDialogOpen(false)
    setEditingIngredient(null)
    loadData()
  }

  const handleDeleteIngredient = async (ingredientId: string) => {
    if (confirm("¿Estás seguro de eliminar este ingrediente?")) {
      const updatedIngredients = ingredients.filter((ing) => ing.id !== ingredientId)
      localStorage.setItem("dstephano-ingredients", JSON.stringify(updatedIngredients))
      toast.success("Ingrediente eliminado")
      loadData()
    }
  }

  const handleOpenRecipeDialog = (recipe?: Recipe) => {
    if (recipe) {
      setEditingRecipe(recipe)
      setSelectedMenuItem(recipe.menuItemId)
      setRendimiento(recipe.rendimiento.toString())
      setMerma(recipe.merma.toString())
      setRecipeIngredients(recipe.ingredientes)
    } else {
      setEditingRecipe(null)
      setSelectedMenuItem("")
      setRendimiento("1")
      setMerma("0.05")
      setRecipeIngredients([])
    }
    setRecipeDialogOpen(true)
  }

  const handleAddRecipeIngredient = () => {
    setRecipeIngredients([...recipeIngredients, { ingredienteId: "", cantidad: 0, unidad: "" }])
  }

  const handleUpdateRecipeIngredient = (index: number, field: string, value: string) => {
    const updated = [...recipeIngredients]
    if (field === "cantidad") {
      updated[index].cantidad = Number.parseFloat(value) || 0
    } else {
      updated[index][field as keyof (typeof updated)[0]] = value as never
    }
    setRecipeIngredients(updated)
  }

  const handleRemoveRecipeIngredient = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index))
  }

  const handleSaveRecipe = () => {
    if (!selectedMenuItem || recipeIngredients.length === 0) {
      toast.error("Completa todos los campos")
      return
    }

    if (editingRecipe) {
      const updatedRecipes = recipes.map((r) =>
        r.id === editingRecipe.id
          ? {
              ...r,
              menuItemId: selectedMenuItem,
              ingredientes: recipeIngredients,
              rendimiento: Number.parseFloat(rendimiento),
              merma: Number.parseFloat(merma),
            }
          : r,
      )
      localStorage.setItem("dstephano-recipes", JSON.stringify(updatedRecipes))
      toast.success("Receta actualizada")
    } else {
      const newRecipe: Recipe = {
        id: `r-${Date.now()}`,
        menuItemId: selectedMenuItem,
        ingredientes: recipeIngredients,
        rendimiento: Number.parseFloat(rendimiento),
        merma: Number.parseFloat(merma),
      }
      const updatedRecipes = [...recipes, newRecipe]
      localStorage.setItem("dstephano-recipes", JSON.stringify(updatedRecipes))
      toast.success("Receta creada")
    }

    setRecipeDialogOpen(false)
    setEditingRecipe(null)
    loadData()
  }

  const handleDeleteRecipe = (recipeId: string) => {
    if (confirm("¿Estás seguro de eliminar esta receta?")) {
      const updatedRecipes = recipes.filter((r) => r.id !== recipeId)
      localStorage.setItem("dstephano-recipes", JSON.stringify(updatedRecipes))
      toast.success("Receta eliminada")
      loadData()
    }
  }

  const getStockStatus = (ingredient: Ingredient) => {
    const percentage = (ingredient.stock / ingredient.minimo) * 100
    if (percentage <= 50) return { label: "Crítico", color: "bg-red-500/20 text-red-500 border-red-500/50" }
    if (percentage <= 100) return { label: "Bajo", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" }
    return { label: "OK", color: "bg-green-500/20 text-green-500 border-green-500/50" }
  }

  if (currentRole !== "admin") return null

  const criticalIngredients = ingredients.filter((i) => i.stock <= i.minimo * 0.5)
  const lowIngredients = ingredients.filter((i) => i.stock > i.minimo * 0.5 && i.stock <= i.minimo)
  const totalValue = ingredients.reduce((sum, i) => sum + i.stock * i.costo, 0)

  return (
    <AppShell title="Inventario y Recetas">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Ingredientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ingredients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Stock Crítico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{criticalIngredients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{lowIngredients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">S/ {totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ingredientes">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="ingredientes">Ingredientes</TabsTrigger>
            <TabsTrigger value="recetas">Recetas (BOM)</TabsTrigger>
            <TabsTrigger value="alertas">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredientes" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Gestión de Ingredientes</h3>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenIngredientDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Ingrediente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingIngredient ? "Editar Ingrediente" : "Agregar Ingrediente"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre</Label>
                      <Input
                        id="nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Pescado del día"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stock">Stock Actual</Label>
                        <Input
                          id="stock"
                          type="number"
                          step="0.01"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="unidad">Unidad</Label>
                        <Input
                          id="unidad"
                          value={unidad}
                          onChange={(e) => setUnidad(e.target.value)}
                          placeholder="kg, L, unidad"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minimo">Stock Mínimo</Label>
                        <Input
                          id="minimo"
                          type="number"
                          step="0.01"
                          value={minimo}
                          onChange={(e) => setMinimo(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="costo">Costo Unitario (S/)</Label>
                        <Input
                          id="costo"
                          type="number"
                          step="0.01"
                          value={costo}
                          onChange={(e) => setCosto(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleCreateIngredient}>
                      {editingIngredient ? "Actualizar Ingrediente" : "Agregar Ingrediente"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {ingredients.map((ingredient) => {
                    const status = getStockStatus(ingredient)
                    return (
                      <div key={ingredient.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-medium">{ingredient.nombre}</p>
                            <Badge className={`border ${status.color}`}>{status.label}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              Stock: {ingredient.stock} {ingredient.unidad}
                            </span>
                            <span>
                              Mínimo: {ingredient.minimo} {ingredient.unidad}
                            </span>
                            <span>Costo: S/ {ingredient.costo}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-2">
                            <p className="text-lg font-bold">S/ {(ingredient.stock * ingredient.costo).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Valor total</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleOpenIngredientDialog(ingredient)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteIngredient(ingredient.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recetas" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Bill of Materials (BOM)</h3>
              <Button onClick={() => handleOpenRecipeDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Receta
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                {recipes.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No hay recetas configuradas</p>
                ) : (
                  <div className="space-y-4">
                    {recipes.map((recipe) => {
                      const menuItem = menu.find((m) => m.id === recipe.menuItemId)
                      return (
                        <div key={recipe.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium">{menuItem?.nombre || "Plato desconocido"}</h4>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleOpenRecipeDialog(recipe)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteRecipe(recipe.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {recipe.ingredientes.map((ing, index) => {
                              const ingredient = ingredients.find((i) => i.id === ing.ingredienteId)
                              return (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">{ingredient?.nombre || "Desconocido"}</span>
                                  <span>
                                    {ing.cantidad} {ing.unidad}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                          <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                            <span className="text-muted-foreground">Rendimiento:</span>
                            <span>{recipe.rendimiento} porción(es)</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Merma:</span>
                            <span>{(recipe.merma * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alertas" className="mt-4 space-y-4">
            <h3 className="text-lg font-semibold">Alertas de Stock</h3>

            {criticalIngredients.length > 0 && (
              <Card className="border-red-500/50">
                <CardHeader>
                  <CardTitle className="text-red-500 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Stock Crítico
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {criticalIngredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{ingredient.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            Stock: {ingredient.stock} {ingredient.unidad} (Mínimo: {ingredient.minimo})
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Package className="h-4 w-4 mr-2" />
                          Ordenar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {lowIngredients.length > 0 && (
              <Card className="border-yellow-500/50">
                <CardHeader>
                  <CardTitle className="text-yellow-500 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Stock Bajo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lowIngredients.map((ingredient) => (
                      <div key={ingredient.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{ingredient.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            Stock: {ingredient.stock} {ingredient.unidad} (Mínimo: {ingredient.minimo})
                          </p>
                        </div>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Package className="h-4 w-4 mr-2" />
                          Ordenar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {criticalIngredients.length === 0 && lowIngredients.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center py-8 text-muted-foreground">No hay alertas de stock</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Recipe Dialog */}
        <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecipe ? "Editar Receta" : "Crear Nueva Receta"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="menuItem">Plato</Label>
                <Select value={selectedMenuItem} onValueChange={setSelectedMenuItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un plato" />
                  </SelectTrigger>
                  <SelectContent>
                    {menu.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rendimiento">Rendimiento (porciones)</Label>
                  <Input
                    id="rendimiento"
                    type="number"
                    step="1"
                    value={rendimiento}
                    onChange={(e) => setRendimiento(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="merma">Merma (%)</Label>
                  <Input
                    id="merma"
                    type="number"
                    step="0.01"
                    value={merma}
                    onChange={(e) => setMerma(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Ingredientes</Label>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddRecipeIngredient}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {recipeIngredients.map((ing, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Select
                          value={ing.ingredienteId}
                          onValueChange={(value) => handleUpdateRecipeIngredient(index, "ingredienteId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ingrediente" />
                          </SelectTrigger>
                          <SelectContent>
                            {ingredients.map((ingredient) => (
                              <SelectItem key={ingredient.id} value={ingredient.id}>
                                {ingredient.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Cantidad"
                          value={ing.cantidad || ""}
                          onChange={(e) => handleUpdateRecipeIngredient(index, "cantidad", e.target.value)}
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          placeholder="Unidad"
                          value={ing.unidad}
                          onChange={(e) => handleUpdateRecipeIngredient(index, "unidad", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveRecipeIngredient(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={handleSaveRecipe}>
                {editingRecipe ? "Actualizar Receta" : "Crear Receta"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  )
}
