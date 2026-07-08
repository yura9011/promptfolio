import { Suspense, lazy } from 'react'

const Scene = lazy(() => import('./Scene'))

interface Props {
  images: string[]
}

export default function InfiniteCanvas({ images }: Props) {
  return (
    <Suspense fallback={null}>
      <Scene images={images} />
    </Suspense>
  )
}
