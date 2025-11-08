// components/RoleCard/RoleCard.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { RoleCard } from "."; // Importa el componente que acabamos de crear
import { ShieldCheck } from "lucide-react"; // Importa uno de tus íconos

// Configuración para Storybook
const meta: Meta<typeof RoleCard> = {
  title: "UI Kit/RoleCard", // El título que verás en Storybook
  component: RoleCard,
  tags: ["autodocs"], // Habilita la documentación automática
  parameters: {
    // Documentación para tu equipo
    docs: {
      description: {
        component:
          "Esta es la tarjeta interactiva para selección de rol. Se basa en los hallazgos de Hotjar (Mapas de Clics y Movimiento) que indicaron que los usuarios intentaban hacer clic en toda la tarjeta, no en un botón interno.",
      },
    },
  },
  argTypes: {
    // Esto crea "controles" en Storybook para jugar con tu componente
    title: { control: "text" },
    description: { control: "text" },
    color: { control: "text" },
    icon: { control: false },
    onClick: { action: "clicked" }, // Esto registrará los clics en el panel "Actions"
  },
};

export default meta;
type Story = StoryObj<typeof RoleCard>;

// Esta es la "historia" principal
export const Administrador: Story = {
  args: {
    // Datos de ejemplo para la historia
    title: "Administrador",
    description: "Acceso completo al sistema",
    color: "text-primary",
    icon: ShieldCheck,
  },
};