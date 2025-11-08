// components/StatCard/index.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link"; // ¡Usamos Link porque estas tarjetas SÍ llevan a otra página!

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  href: string; // La URL a donde navegará (ej. /admin/reportes/ventas)
};

export const StatCard = ({ title, value, description, href }: StatCardProps) => {
  return (
    // ¡AQUÍ ESTÁ LA SOLUCIÓN DEL MAPA DE CALOR!
    // Envolvemos todo en un <Link> y añadimos la microinteracción
    <Link
      href={href}
      className="block rounded-lg shadow-md transition-all duration-300
                 hover:shadow-xl hover:scale-[1.03] 
                 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
};