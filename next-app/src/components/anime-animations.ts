'use client'

import { animate, onScroll, type JSAnimation } from 'animejs'
import { useLayoutEffect, useRef, useState } from 'react'

export function shouldReduceMotion() {
  return typeof window.matchMedia !== 'function'
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function animatePageScroll(top: number): JSAnimation | null {
  if (shouldReduceMotion()) {
    window.scrollTo({ top })
    return null
  }

  const position = { top: window.scrollY }
  const distance = Math.abs(top - position.top)

  return animate(position, {
    top,
    duration: Math.min(800, Math.max(300, distance * 0.45)),
    ease: 'inOutCubic',
    onUpdate: () => window.scrollTo({ top: position.top }),
  })
}

export function observeCardEntrance(element: HTMLElement) {
  if (shouldReduceMotion()) return undefined

  let entranceAnimation: JSAnimation | null = null
  const observer = onScroll({
    target: element,
    enter: 'top 90%',
    repeat: false,
    onEnter: () => {
      entranceAnimation = animate(element, {
        opacity: [0, 1],
        translateY: [18, 0],
        duration: 420,
        ease: 'outCubic',
      })
    },
  })

  return () => {
    entranceAnimation?.revert()
    observer.revert()
  }
}

export function useAnimeDisclosure(isExpanded: boolean, initiallyVisible = false) {
  const panelRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<JSAnimation | null>(null)
  const hasMounted = useRef(false)
  const [isPanelVisible, setIsPanelVisible] = useState(initiallyVisible)

  useLayoutEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }

    if (isExpanded && !isPanelVisible) {
      setIsPanelVisible(true)
      return
    }
    if (!isExpanded && !isPanelVisible) return

    const panel = panelRef.current
    if (!panel) return

    animationRef.current?.revert()
    animationRef.current = null

    if (shouldReduceMotion()) {
      panel.style.removeProperty('height')
      panel.style.removeProperty('opacity')
      panel.style.removeProperty('overflow')
      if (!isExpanded) setIsPanelVisible(false)
      return
    }

    const currentHeight = isExpanded ? 0 : panel.getBoundingClientRect().height
    const targetHeight = isExpanded ? panel.scrollHeight : 0
    panel.style.height = `${currentHeight}px`
    panel.style.opacity = isExpanded ? '0' : '1'
    panel.style.overflow = 'hidden'

    const animation = animate(panel, {
      height: targetHeight,
      opacity: isExpanded ? 1 : 0,
      duration: isExpanded ? 280 : 210,
      ease: isExpanded ? 'outCubic' : 'inCubic',
      onComplete: () => {
        animationRef.current = null
        panel.style.removeProperty('height')
        panel.style.removeProperty('opacity')
        panel.style.removeProperty('overflow')
        if (!isExpanded) setIsPanelVisible(false)
      },
    })
    animationRef.current = animation

    return () => {
      if (animationRef.current !== animation) return
      animation.revert()
      animationRef.current = null
      panel.style.removeProperty('height')
      panel.style.removeProperty('opacity')
      panel.style.removeProperty('overflow')
    }
  }, [isExpanded, isPanelVisible])

  return { panelRef, isPanelVisible }
}