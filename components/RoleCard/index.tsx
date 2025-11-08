// components/RoleCard/index.tsx

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react"; // Para que acepte el ícono

// Definimos las props que aceptará
type RoleCardProps = {
  title: string;
  description: string;
  color: string;
  icon: LucideIcon;
  onClick: () => void; // Aceptará la función handleRoleSelect
};

// Exportamos nuestro nuevo componente del UI Kit
export const RoleCard = ({ title, description, color, icon: Icon, onClick }: RoleCardProps) => {
  return (
    // SOLUCIÓN #1: Usamos un <button> para accesibilidad, ya que tiene un onClick.
    // SOLUCIÓN #2: Le añadimos 'hover:scale-[1.03]' para la microinteracción que falta.
    <button
      onClick={onClick}
      className="w-full h-full text-left rounded-lg shadow-md transition-all duration-300
                 hover:shadow-xl hover:scale-[1.03] 
                 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <Card className="h-full cursor-pointer">
        <CardHeader>
          {/* Este es tu código de header exacto */}
          <div className="flex items-center gap-3 mb-2">
            <Icon className={`h-8 w-8 ${color}`} />
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* SOLUCIÓN #3: ¡Quitamos el <Button> redundante! 
            El mapa de calor mostró que nadie lo usaba y solo creaba confusión.
            Lo reemplazamos con texto simple para reforzar la acción.
          */}
          <p className="text-sm font-medium text-primary">
            Acceder como {title}
          </p>
        </CardContent>
      </Card>
    </button>
  );
};