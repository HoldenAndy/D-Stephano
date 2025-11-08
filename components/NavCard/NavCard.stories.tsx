// components/NavCard/NavCard.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { NavCard } from "."; // Importa el componente que acabamos de crear
import { Users } from "lucide-react"; // Importa un ícono de ejemplo

// Configuración para Storybook
const meta: Meta<typeof NavCard> = {
  title: "UI Kit/NavCard", // ¡Un nuevo componente para nuestro UI Kit!
  component: NavCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Tarjeta de navegación principal para los dashboards de administrador.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    icon: { control: false },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof NavCard>;

// Esta es la "historia" principal
export const Default: Story = {
  args: {
    title: "Usuarios y Roles",
    description: "Gestionar empleados y permisos",
    icon: Users,
  },
};