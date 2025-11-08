import type { Meta, StoryObj } from '@storybook/react'
import { ReportDisplayCard } from './index'
import { BarChart3, Users } from 'lucide-react'

// Metadata para Storybook
const meta: Meta<typeof ReportDisplayCard> = {
  title: 'UI Kit/ReportDisplayCard',
  component: ReportDisplayCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // Documentación para el PDF: Justificamos por qué no hay interacciones.
    docs: {
      description: {
        component: `
          **Propósito UX:** Esta tarjeta es una variante de las tarjetas de estadística estándar. 
          Fue creada para **eliminar el problema de 'Clics Falsos' (P2)**, detectado en el mapa de calor de Hotjar en la vista de reportes. 
          
          **A diferencia del StatCard**, está diseñada para ser **estrictamente de solo lectura**. 
          Intencionalmente no tiene microinteracciones de \`hover\`, \`shadow\` o enlaces, 
          comunicando al usuario que es solo un cuadro de datos estático, no un control interactivo.
        `,
      },
    },
  },
  argTypes: {
    value: { control: 'text' },
    description: { control: 'text' },
    icon: { control: false }, // Ocultamos el control para íconos complejos
  },
}

export default meta

type Story = StoryObj<typeof ReportDisplayCard>

// Historia por defecto (la más simple)
export const VentasSemana: Story = {
  args: {
    title: 'Ventas Semana',
    value: 'S/ 5,800',
    description: '+15% vs semana anterior',
    icon: <BarChart3 className="h-5 w-5" />,
  },
}

// Historia con otra métrica y otro ícono
export const ClientesAtendidos: Story = {
  args: {
    title: 'Clientes Atendidos',
    value: '185',
    description: '45% recurrentes',
    icon: <Users className="h-5 w-5" />,
  },
}