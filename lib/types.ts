// Core domain types for D'Stephano Restaurant System

export type UserRole =
  | "admin"
  | "mesero"
  | "cocina"
  | "caja"
  | "delivery"
  | "cliente"
  | "inventario"
  | "reservas"
  | "carta"
  | "crm"

export type TableStatus = "libre" | "ocupada" | "reservada" | "limpieza" | "espera"

export type OrderStatus = "nuevo" | "en-preparacion" | "listo" | "servido" | "cancelado"

export type ReservationStatus = "confirmada" | "en-espera" | "caducada" | "completada"

export type DeliveryStatus = "recibido" | "en-preparacion" | "en-camino" | "entregado"

export type PaymentMethod = "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia"

export type KitchenStation = "frio" | "plancha" | "fritura" | "parrilla" | "postres" | "barra"

export interface User {
  id: string
  nombre: string
  rol: UserRole // Primary role for backward compatibility
  roles: UserRole[] // Multiple roles support
  pin?: string
  activo: boolean
  email?: string
  createdAt?: Date
}

export interface Table {
  id: string
  numero: number
  estado: TableStatus
  capacidad: number
  comensales?: number
  meseroAsignado?: string
  pedidoActual?: string
  reservaId?: string
}

export interface MenuItem {
  id: string
  nombre: string
  categoria: string
  precioSalon: number
  precioDelivery: number
  descripcion: string
  foto?: string
  etiquetas: string[]
  disponible: boolean
  estacion: KitchenStation
}

export interface OrderItem {
  id: string
  menuItemId: string
  cantidad: number
  modificadores: string[]
  notas: string
  estacion: KitchenStation
  estado: OrderStatus
  tiempoInicio?: Date
  tiempoListo?: Date
}

export interface Order {
  id: string
  tipo: "mesa" | "delivery"
  mesaId?: string
  clienteId?: string
  items: OrderItem[]
  subtotal: number
  igv: number
  propina: number
  total: number
  estado: OrderStatus
  meseroId?: string
  createdAt: Date
  updatedAt: Date
  type: "salon" | "delivery"
  tableId?: string
  customerId?: string
  status: "pending" | "preparing" | "ready" | "delivering" | "completed" | "cancelled"
  deliveryAddress?: string
  deliveryPhone?: string
  deliveryZone?: string
  deliveryFee?: number
}

export interface Reservation {
  id: string
  clienteNombre: string
  clienteCelular: string
  fecha: Date
  personas: number
  preferencias?: string
  mesaAsignada?: string
  estado: ReservationStatus
  createdAt: Date
}

export interface Customer {
  id: string
  nombre: string
  celular: string
  dni?: string
  email?: string
  direccion?: string
  alergias?: string[]
  favoritos: string[]
  totalVisitas: number
  ticketPromedio: number
  rating?: number
  name: string
  phone?: string
  address?: string
  preferences?: string
  createdAt: Date
}

export interface Ingredient {
  id: string
  nombre: string
  stock: number
  unidad: string
  minimo: number
  costo: number
  lote?: string
  vencimiento?: Date
}

export interface Recipe {
  id: string
  menuItemId: string
  ingredientes: {
    ingredienteId: string
    cantidad: number
    unidad: string
  }[]
  rendimiento: number
  merma: number
}

export interface WaitlistEntry {
  id: string
  clienteNombre: string
  clienteCelular: string
  personas: number
  tiempoEstimado: number
  createdAt: Date
  notificado: boolean
}

export interface DeliveryOrder extends Order {
  direccion: string
  zona: string
  tarifaEnvio: number
  coordenadas?: { lat: number; lng: number }
  repartidorId?: string
  estadoDelivery: DeliveryStatus
  tiempoEstimado?: number
}

export interface Feedback {
  id: string
  rol: UserRole // Added rol field to track which module sent the feedback
  satisfaccion: number // 1-10
  recomendacion: number // 1-10
  comentario: string
  createdAt: Date
}
