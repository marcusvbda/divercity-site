'use client'

import { useEffect, useState } from 'react'

import { endOfWeek, isSameDay, isWithinInterval, startOfWeek } from 'date-fns'

import { EndHour, StartHour } from './constants'

export function useCurrentTimeIndicator(
  currentDate: Date,
  view: 'day' | 'week'
) {
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(0)
  const [currentTimeVisible, setCurrentTimeVisible] = useState<boolean>(false)

  useEffect(() => {
    const calculateTimePosition = () => {
      const now = new Date()
      const totalMinutes = (now.getHours() - StartHour) * 60 + now.getMinutes()
      const dayEndMinutes = (EndHour - StartHour) * 60
      const position = (totalMinutes / dayEndMinutes) * 100

      let isCurrentTimeVisible = false

      if (view === 'day') {
        isCurrentTimeVisible = isSameDay(now, currentDate)
      } else {
        isCurrentTimeVisible = isWithinInterval(now, {
          start: startOfWeek(currentDate, { weekStartsOn: 0 }),
          end: endOfWeek(currentDate, { weekStartsOn: 0 }),
        })
      }

      setCurrentTimePosition(position)
      setCurrentTimeVisible(isCurrentTimeVisible)
    }

    calculateTimePosition()

    const interval = setInterval(calculateTimePosition, 60000)

    return () => clearInterval(interval)
  }, [currentDate, view])

  return { currentTimePosition, currentTimeVisible }
}
