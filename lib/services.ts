import type { User, Table, MenuItem, Order, Reservation, Customer, Ingredient, Recipe } from "./types"

// Mock API service using localStorage
class MockAPI {
  private getFromStorage<T>(key: string): T[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(key, JSON.stringify(data))
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.getFromStorage<User>("dstephano-users")
  }

  async getUserByRole(role: string): Promise<User[]> {
    const users = await this.getUsers()
    return users.filter((u) => u.rol === role)
  }

  // Tables
  async getTables(): Promise<Table[]> {
    return this.getFromStorage<Table>("dstephano-tables")
  }

  async updateTable(id: string, updates: Partial<Table>): Promise<Table> {
    const tables = await this.getTables()
    const index = tables.findIndex((t) => t.id === id)
    if (index === -1) throw new Error("Table not found")
    tables[index] = { ...tables[index], ...updates }
    this.saveToStorage("dstephano-tables", tables)
    return tables[index]
  }

  // Menu
  async getMenu(): Promise<MenuItem[]> {
    return this.getFromStorage<MenuItem>("dstephano-menu")
  }

  async getMenuByCategory(category: string): Promise<MenuItem[]> {
    const menu = await this.getMenu()
    return menu.filter((item) => item.categoria === category)
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const menu = await this.getMenu()
    const index = menu.findIndex((m) => m.id === id)
    if (index === -1) throw new Error("Menu item not found")
    menu[index] = { ...menu[index], ...updates }
    this.saveToStorage("dstephano-menu", menu)
    return menu[index]
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return this.getFromStorage<Order>("dstephano-orders")
  }

  async createOrder(order: Order): Promise<Order> {
    const orders = await this.getOrders()
    orders.push(order)
    this.saveToStorage("dstephano-orders", orders)
    return order
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const orders = await this.getOrders()
    const index = orders.findIndex((o) => o.id === id)
    if (index === -1) throw new Error("Order not found")
    orders[index] = { ...orders[index], ...updates }
    this.saveToStorage("dstephano-orders", orders)
    return orders[index]
  }

  // Reservations
  async getReservations(): Promise<Reservation[]> {
    return this.getFromStorage<Reservation>("dstephano-reservations")
  }

  async createReservation(reservation: Reservation): Promise<Reservation> {
    const reservations = await this.getReservations()
    reservations.push(reservation)
    this.saveToStorage("dstephano-reservations", reservations)
    return reservation
  }

  async updateReservation(id: string, updates: Partial<Reservation>): Promise<Reservation> {
    const reservations = await this.getReservations()
    const index = reservations.findIndex((r) => r.id === id)
    if (index === -1) throw new Error("Reservation not found")
    reservations[index] = { ...reservations[index], ...updates }
    this.saveToStorage("dstephano-reservations", reservations)
    return reservations[index]
  }

  async deleteReservation(id: string): Promise<void> {
    const reservations = await this.getReservations()
    const filtered = reservations.filter((r) => r.id !== id)
    this.saveToStorage("dstephano-reservations", filtered)
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    return this.getFromStorage<Customer>("dstephano-customers")
  }

  async getCustomerByPhone(phone: string): Promise<Customer | null> {
    const customers = await this.getCustomers()
    return customers.find((c) => c.celular === phone) || null
  }

  // Ingredients
  async getIngredients(): Promise<Ingredient[]> {
    return this.getFromStorage<Ingredient>("dstephano-ingredients")
  }

  async updateIngredient(id: string, updates: Partial<Ingredient>): Promise<Ingredient> {
    const ingredients = await this.getIngredients()
    const index = ingredients.findIndex((i) => i.id === id)
    if (index === -1) throw new Error("Ingredient not found")
    ingredients[index] = { ...ingredients[index], ...updates }
    this.saveToStorage("dstephano-ingredients", ingredients)
    return ingredients[index]
  }

  // Recipes
  async getRecipes(): Promise<Recipe[]> {
    return this.getFromStorage<Recipe>("dstephano-recipes")
  }

  async getRecipeByMenuItem(menuItemId: string): Promise<Recipe | null> {
    const recipes = await this.getRecipes()
    return recipes.find((r) => r.menuItemId === menuItemId) || null
  }
}

export const mockAPI = new MockAPI()
