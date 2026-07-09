import { useState, useEffect, useCallback, lazy, Suspense } from 'react'

const Scene = lazy(() => import('./Scene'))

interface Props {
  images: string[]
}

export default function InfiniteCanvas({ images }: Props) {
  const [active, setActive] = useState(false)

  const activate = useCallback(() => setActive(true), [])
  const deactivate = useCallback(() => setActive(false), [])

  useEffect(() => {
    (window as any).__activateCanvas = activate
    (window as any).__deactivateCanvas = deactivate
    return () => {
      delete (window as any).__activateCanvas
      delete (window as any).__deactivateCanvas
    }
  }, [activate, deactivate])

  if (!active) return null

  return (
    <Suspense fallback={null}>
      <Scene images={images} />
    </Suspense>
  )
}
