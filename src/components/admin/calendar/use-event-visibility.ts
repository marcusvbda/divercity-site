'use client'

import { useLayoutEffect, useRef, useState } from 'react'

interface EventVisibilityOptions {
  eventHeight: number
  eventGap: number
}

export function useEventVisibility({
  eventHeight,
  eventGap,
}: EventVisibilityOptions) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    const element = contentRef.current

    if (!element) return

    const updateHeight = () => setContentHeight(element.clientHeight)

    updateHeight()

    const observer = new ResizeObserver(updateHeight)

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const getVisibleEventCount = (totalEvents: number): number => {
    if (!contentHeight) return totalEvents

    const maxEvents = Math.floor(contentHeight / (eventHeight + eventGap))

    if (totalEvents <= maxEvents) return totalEvents

    return maxEvents > 0 ? maxEvents - 1 : 0
  }

  return { contentRef, contentHeight, getVisibleEventCount }
}
