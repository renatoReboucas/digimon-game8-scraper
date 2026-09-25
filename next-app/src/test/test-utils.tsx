import type { ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { TooltipProvider } from '@/components/ui/tooltip'

export function renderWithTooltip(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => <TooltipProvider>{children}</TooltipProvider>,
    ...options,
  })
}