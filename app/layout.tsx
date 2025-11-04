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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />

        {/* --- INICIA EL CÓDIGO DE HOTJAR --- */}
        {/* 2. AÑADIMOS TU SCRIPT EXACTO AQUÍ */}
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function (c, s, q, u, a, r, e) {
                c.hj=c.hj||function(){(c.hj.q=c.hj.q||[]).push(arguments)};
                c._hjSettings = { hjid: a };
                r = s.getElementsByTagName('head')[0];
                e = s.createElement('script');
                e.async = true;
                e.src = q + c._hjSettings.hjid + u;
                r.appendChild(e);
            })(window, document, 'https://static.hj.contentsquare.net/c/csq-', '.js', 6565494);
          `}
        </Script>
        {/* --- TERMINA EL CÓDIGO DE HOTJAR --- */}

      </body>
    </html>
  )
}