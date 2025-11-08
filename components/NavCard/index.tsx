// components/NavCard/index.tsx

import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

// Definimos las props que aceptará
type NavCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
};

// Exportamos nuestro nuevo componente del UI Kit
export const NavCard = ({ title, description, icon: Icon, onClick }: NavCardProps) => {
  return (
    // ¡AQUÍ ESTÁ LA MICROINTERACCIÓN QUE PIDIÓ EL PROFE!
    // Añadimos 'hover:scale-[1.03]'
    <button
      onClick={onClick}
      className="w-full h-full text-left rounded-lg shadow-md transition-all duration-300
                 hover:shadow-xl hover:scale-[1.03] 
                 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {/* Tu código de Card, pero sin el 'hover:' y 'cursor-pointer'
        porque ahora los maneja el <button> de arriba.
      */}
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Icon className="h-8 w-8 text-primary" />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </button>
  );
};