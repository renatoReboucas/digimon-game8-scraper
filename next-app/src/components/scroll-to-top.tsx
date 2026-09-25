'use client'

import { ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 250)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={`scroll-to-top${isVisible ? ' is-visible' : ''}`}
          variant="ghost"
          size="icon"
          type="button"
          aria-label="Rolar para o começo"
          onClick={scrollToTop}
        >
          <ChevronUp aria-hidden="true" size={22} strokeWidth={2.2} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Rolar para o começo</TooltipContent>
    </Tooltip>
  )
}
