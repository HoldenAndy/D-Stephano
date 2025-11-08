// components/StatCard/StatCard.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { StatCard } from ".";

const meta: Meta<typeof StatCard> = {
  title: "UI Kit/StatCard", // ¡Tercer componente!
  component: StatCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Tarjeta de estadística para dashboards. Justificada por el mapa de calor de Hotjar que mostró 'clics a lo loco'. Se añadió un hover para comunicar la interactividad.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    value: { control: "text" },
    description: { control: "text" },
    href: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    title: "Ventas Hoy",
    value: "S/ 2,450",
    description: "+12% vs ayer",
    href: "/admin/reportes/ventas", // Hacia dónde va
  },
};