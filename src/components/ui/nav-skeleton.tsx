import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const VARY_WIDTHS = [75, 60, 90]

export function NavSkeleton({
  count = 4,
  className,
  varyWidth = false,
}: {
  count?: number
  className?: string
  varyWidth?: boolean
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('bg-muted/50', className)}
          style={
            varyWidth
              ? { width: `${VARY_WIDTHS[i % VARY_WIDTHS.length]}%` }
              : undefined
          }
        />
      ))}
    </>
  )
}
