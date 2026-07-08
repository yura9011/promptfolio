import { useRef, useState, useMemo } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { TextureLoader } from 'three'

interface Props {
  src: string
  position: [number, number]
  onClick?: (src: string) => void
}

const PLANE_WIDTH = 3
const PLANE_GAP = 0.15

export default function ImagePlane({ src, position, onClick }: Props) {
  const ref = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  const texture = useLoader(TextureLoader, src)
  const img = texture.image
  const aspect = img ? img.width / img.height : 1
  const w = PLANE_WIDTH - PLANE_GAP
  const h = w / aspect

  useFrame(({ camera }) => {
    if (!ref.current) return
    const dx = camera.position.x - position[0]
    const dy = camera.position.y - position[1]
    const dist = Math.sqrt(dx * dx + dy * dy)
    ref.current.visible = dist < 30
  })

  return (
    <mesh
      ref={ref}
      position={[position[0], position[1], 0]}
      onClick={(e) => { e.stopPropagation(); onClick?.(src) }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.08 : 1}
    >
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}
