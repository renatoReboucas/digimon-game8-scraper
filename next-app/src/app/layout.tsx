import type { ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

export const metadata = {
  title: 'Digimon Atlas | Catálogo de Digimon e evoluções',
  description: 'Pesquise o catálogo de Digimon, consulte atributos e explore evoluções e de-evoluções.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <NuqsAdapter>
          <TooltipProvider delayDuration={300} skipDelayDuration={200}>
            {children}
          </TooltipProvider>
        </NuqsAdapter>
        <Analytics />
      </body>
    </html>
  )
}
