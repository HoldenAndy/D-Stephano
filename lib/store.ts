import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  User,
  UserRole,
  Customer,
  Order,
  Table,
  MenuItem,
  Ingredient,
  Recipe,
  Reservation,
  Feedback,
} from "./types"

interface AuthState {
  currentUser: User | null
  currentRole: UserRole | null
  setUser: (user: User) => void
  setRole: (role: UserRole) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      currentRole: null,
      setUser: (user) => set({ currentUser: user, currentRole: user.rol }),
      setRole: (role) => set({ currentRole: role }),
      logout: () => set({ currentUser: null, currentRole: null }),
    }),
    {
      name: "dstephano-auth",
    },
  ),
)

interface CartState {
  items: Array<{
    menuItemId: string
    cantidad: number
    modificadores: string[]
    notas: string
  }>
  addItem: (item: CartState["items"][0]) => void
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, cantidad: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),
      updateQuantity: (menuItemId, cantidad) =>
        set((state) => ({
          items: state.items.map((i) => (i.menuItemId === menuItemId ? { ...i, cantidad } : i)),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "dstephano-cart",
    },
  ),
)

interface AppState {
  customers: Customer[]
  orders: Order[]
  tables: Table[]
  menu: MenuItem[]
  ingredients: Ingredient[]
  recipes: Recipe[]
  reservations: Reservation[]
  users: User[]
  feedbacks: Feedback[]
  addCustomer: (
    customer: Omit<
      Customer,
      "id" | "createdAt" | "nombre" | "celular" | "favoritos" | "totalVisitas" | "ticketPromedio"
    >,
  ) => void
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  addOrder: (order: Order) => void
  updateOrder: (id: string, order: Partial<Order>) => void
  addUser: (user: Omit<User, "id" | "createdAt">) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  addFeedback: (feedback: Omit<Feedback, "id" | "createdAt">) => void
  loadData: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      customers: [],
      orders: [],
      tables: [],
      menu: [],
      ingredients: [],
      recipes: [],
      reservations: [],
      users: [],
      feedbacks: [],

      addCustomer: (customerData) => {
        const newCustomer: Customer = {
          id: `c${Date.now()}`,
          name: customerData.name,
          nombre: customerData.name,
          phone: customerData.phone,
          celular: customerData.phone || "",
          email: customerData.email,
          address: customerData.address,
          direccion: customerData.address,
          preferences: customerData.preferences,
          favoritos: [],
          totalVisitas: 0,
          ticketPromedio: 0,
          createdAt: new Date(),
        }
        set((state) => ({
          customers: [...state.customers, newCustomer],
        }))
      },

      updateCustomer: (id, customerData) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === id ? { ...c, ...customerData } : c)),
        }))
      },

      addOrder: (order) => {
        set((state) => ({
          orders: [...state.orders, order],
        }))
      },

      updateOrder: (id, orderData) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, ...orderData } : o)),
        }))
      },

      addUser: (userData) => {
        const newUser: User = {
          id: `u${Date.now()}`,
          ...userData,
          roles: userData.roles || [userData.rol],
          createdAt: new Date(),
        }
        set((state) => ({
          users: [...state.users, newUser],
        }))
      },

      updateUser: (id, userData) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...userData } : u)),
        }))
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }))
      },

      addFeedback: (feedbackData) => {
        const newFeedback: Feedback = {
          id: `f${Date.now()}`,
          ...feedbackData,
          createdAt: new Date(),
        }
        set((state) => ({
          feedbacks: [...state.feedbacks, newFeedback],
        }))
      },

      loadData: () => {
        if (typeof window === "undefined") return

        const customers = JSON.parse(localStorage.getItem("dstephano-customers") || "[]")
        const orders = JSON.parse(localStorage.getItem("dstephano-orders") || "[]")
        const tables = JSON.parse(localStorage.getItem("dstephano-tables") || "[]")
        const menu = JSON.parse(localStorage.getItem("dstephano-menu") || "[]")
        const ingredients = JSON.parse(localStorage.getItem("dstephano-ingredients") || "[]")
        const recipes = JSON.parse(localStorage.getItem("dstephano-recipes") || "[]")
        const reservations = JSON.parse(localStorage.getItem("dstephano-reservations") || "[]")
        const users = JSON.parse(localStorage.getItem("dstephano-users") || "[]")
        const feedbacks = JSON.parse(localStorage.getItem("dstephano-feedbacks") || "[]")

        set({
          customers,
          orders,
          tables,
          menu,
          ingredients,
          recipes,
          reservations,
          users,
          feedbacks,
        })
      },
    }),
    {
      name: "dstephano-app-data",
    },
  ),
)
