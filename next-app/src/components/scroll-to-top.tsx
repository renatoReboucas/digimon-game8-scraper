'use client'

import { ChevronUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { JSAnimation } from 'animejs'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { animatePageScroll } from './anime-animations'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const scrollAnimation = useRef<JSAnimation | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 250)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      scrollAnimation.current?.revert()
    }
  }, [])

  const scrollToTop = () => {
    scrollAnimation.current?.revert()
    scrollAnimation.current = animatePageScroll(0)
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
