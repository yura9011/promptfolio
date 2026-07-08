import { useState, useCallback, useMemo, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import CameraController from './CameraController'
import ImagePlane from './ImagePlane'
import ImageLightbox from './ImageLightbox'

interface Props {
  images: string[]
}

const IMAGES_PER_ROW = 10
const PLANE_STEP = 3.3

export default function InfiniteCanvas({ images }: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const currentIndex = lightboxSrc ? images.indexOf(lightboxSrc) : -1

  const handleOpen = useCallback((src: string) => setLightboxSrc(src), [])
  const handleClose = useCallback(() => setLightboxSrc(null), [])
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setLightboxSrc(images[currentIndex - 1])
  }, [currentIndex, images])
  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) setLightboxSrc(images[currentIndex + 1])
  }, [currentIndex, images])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxSrc) return
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxSrc, handleClose, handlePrev, handleNext])

  const positions = useMemo(() => {
    return images.map((_, i) => {
      const row = Math.floor(i / IMAGES_PER_ROW)
      const col = i % IMAGES_PER_ROW
      const x = col * PLANE_STEP - (IMAGES_PER_ROW * PLANE_STEP) / 2
      const y = -row * PLANE_STEP + (Math.ceil(images.length / IMAGES_PER_ROW) * PLANE_STEP) / 2
      return [x, y] as [number, number]
    })
  }, [images])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 20], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => gl.setClearColor('#000000')}
      >
        <CameraController />
        {images.map((src, i) => (
          <ImagePlane key={src} src={src} position={positions[i]} onClick={handleOpen} />
        ))}
      </Canvas>
      <ImageLightbox
        src={lightboxSrc}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  )
}
