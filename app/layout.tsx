// Reemplaza TODO tu layout.tsx con este código:

import Script from "next/script" // 1. IMPORTAMOS SCRIPT
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "D'Stephano - Sistema de Gestión",
  description: "Sistema integral de gestión para restaurante de comida marina",
  generator: 'v0.app'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* Script de Contentsquare */}
        <Script 
          src="https://t.contentsquare.net/uxa/4bb9cc536ee51.js" 
          strategy="afterInteractive" 
        />
        
        {children}
      </body>
    </html>
  )
}
