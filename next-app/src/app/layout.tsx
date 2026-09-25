import type { ReactNode } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import './globals.css'

export const metadata = {
  title: 'Digimon Atlas',
  description: 'Catalogo de Digimon e suas linhas evolutivas.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}
