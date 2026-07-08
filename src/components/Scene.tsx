import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber'
import { KeyboardControls, useKeyboardControls } from '@react-three/drei'
import { TextureLoader, PlaneGeometry, DoubleSide } from 'three'
import { clamp, lerp, hashString, seededRandom } from './utils'

interface Props {
  images: string[]
}

const CHUNK_SIZE = 40
const RENDER_DISTANCE = 2
const IMAGES_PER_CHUNK = 4
const PLANE_SIZE = 4
const INITIAL_CAMERA_Z = 45
const MAX_VELOCITY = 4
const KEYBOARD_SPEED = 0.2
const VELOCITY_LERP = 0.16
const VELOCITY_DECAY = 0.9
const FOG_NEAR = 80
const FOG_FAR = 200
const INVIS_THRESHOLD = 0.01

const PLANE_GEOMETRY = new PlaneGeometry(1, 1)

const KEYBOARD_MAP = [
  { name: 'forward', keys: ['w', 'W', 'ArrowUp'] },
  { name: 'backward', keys: ['s', 'S', 'ArrowDown'] },
  { name: 'left', keys: ['a', 'A', 'ArrowLeft'] },
  { name: 'right', keys: ['d', 'D', 'ArrowRight'] },
  { name: 'up', keys: ['e', 'E'] },
  { name: 'down', keys: ['q', 'Q'] },
]

function computeChunks(images: string[]) {
  const chunks = new Map<string, { cx: number; cy: number; cz: number; planes: { src: string; x: number; y: number; z: number }[] }>()

  images.forEach((src, i) => {
    const chunkIdx = Math.floor(i / IMAGES_PER_CHUNK)
    const cx = chunkIdx % 10
    const cy = -Math.floor(chunkIdx / 10)
    const cz = 0
    const key = `${cx},${cy},${cz}`

    if (!chunks.has(key)) {
      chunks.set(key, { cx, cy, cz, planes: [] })
    }

    const seed = hashString(key) + (i % IMAGES_PER_CHUNK) * 1000
    chunks.get(key)!.planes.push({
      src,
      x: cx * CHUNK_SIZE + seededRandom(seed) * CHUNK_SIZE,
      y: cy * CHUNK_SIZE + seededRandom(seed + 1) * CHUNK_SIZE,
      z: seededRandom(seed + 2) * 4 - 2,
    })
  })

  return chunks
}

function ImagePlane({ src, x, y, z, onClick }: { src: string; x: number; y: number; z: number; onClick: (src: string) => void }) {
  const ref = useRef<any>(null)
  const materialRef = useRef<any>(null)
  const opacity = useRef(0)
  const texture = useLoader(TextureLoader, src)
  const img = texture.image
  const aspect = img ? img.width / img.height : 1
  const w = PLANE_SIZE
  const h = w / aspect

  useFrame(({ camera }) => {
    const mesh = ref.current
    const mat = materialRef.current
    if (!mesh || !mat) return

    const dx = camera.position.x - x
    const dy = camera.position.y - y
    const dz = camera.position.z - z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    const maxDist = (RENDER_DISTANCE + 1) * CHUNK_SIZE
    const fadeStart = maxDist * 0.5
    const target = dist < fadeStart ? 1 : Math.max(0, 1 - (dist - fadeStart) / (maxDist - fadeStart))

    opacity.current = lerp(opacity.current, target, 0.12)

    if (opacity.current < INVIS_THRESHOLD) {
      mesh.visible = false
      return
    }

    mesh.visible = true
    mat.opacity = opacity.current
    mat.depthWrite = opacity.current > 0.99
  })

  return (
    <mesh
      ref={ref}
      position={[x, y, z]}
      geometry={PLANE_GEOMETRY}
      scale={[w, h, 1]}
      visible={false}
      onClick={(e) => { e.stopPropagation(); onClick(src) }}
    >
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        toneMapped={false}
        transparent
        opacity={0}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  )
}

function Lightbox({ src, onClose, onPrev, onNext }: { src: string | null; onClose: () => void; onPrev: () => void; onNext: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!src) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [src, onClose, onPrev, onNext])

  if (!src) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <button onClick={onClose} style={{
        position: 'absolute', top: '1rem', right: '1rem',
        width: '2.5rem', height: '2.5rem', border: 'none',
        background: 'rgba(0,0,0,0.6)', color: '#fff',
        fontSize: '1.5rem', cursor: 'pointer', borderRadius: '50%',
        zIndex: 10001, opacity: 0.6,
      }}>&times;</button>
      <button onClick={onPrev} style={{
        position: 'absolute', top: '50%', left: '1rem',
        transform: 'translateY(-50%)',
        width: '2.5rem', height: '2.5rem', border: 'none',
        background: 'rgba(0,0,0,0.6)', color: '#fff',
        fontSize: '1.25rem', cursor: 'pointer', borderRadius: '50%',
        zIndex: 10001, opacity: 0.6,
      }}>&larr;</button>
      <button onClick={onNext} style={{
        position: 'absolute', top: '50%', right: '1rem',
        transform: 'translateY(-50%)',
        width: '2.5rem', height: '2.5rem', border: 'none',
        background: 'rgba(0,0,0,0.6)', color: '#fff',
        fontSize: '1.25rem', cursor: 'pointer', borderRadius: '50%',
        zIndex: 10001, opacity: 0.6,
      }}>&rarr;</button>
      <div style={{ maxWidth: '95vw', maxHeight: '95vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={src} alt="" style={{ maxWidth: '100%', maxHeight: '95vh', objectFit: 'contain', cursor: 'default' }} />
      </div>
    </div>
  )
}

function SceneController({ images, onOpen }: { images: string[]; onOpen: (src: string) => void }) {
  const { camera, gl } = useThree()
  const [, getKeys] = useKeyboardControls()

  const chunks = useMemo(() => computeChunks(images), [images])
  const chunkList = useMemo(() => Array.from(chunks.values()), [chunks])

  const state = useRef({
    velocity: { x: 0, y: 0, z: 0 },
    targetVel: { x: 0, y: 0, z: 0 },
    basePos: { x: 0, y: 0, z: INITIAL_CAMERA_Z },
    drift: { x: 0, y: 0 },
    mouse: { x: 0, y: 0 },
    lastMouse: { x: 0, y: 0 },
    scrollAccum: 0,
    isDragging: false,
  })

  const [visibleChunks, setVisibleChunks] = useState<typeof chunkList>([])

  useEffect(() => {
    const canvas = gl.domElement

    const onMouseDown = (e: MouseEvent) => {
      state.current.isDragging = true
      state.current.lastMouse = { x: e.clientX, y: e.clientY }
    }
    const onMouseUp = () => { state.current.isDragging = false }
    const onMouseMove = (e: MouseEvent) => {
      const s = state.current
      s.mouse = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1 }
      if (s.isDragging) {
        s.targetVel.x -= (e.clientX - s.lastMouse.x) * 0.025
        s.targetVel.y += (e.clientY - s.lastMouse.y) * 0.025
        s.lastMouse = { x: e.clientX, y: e.clientY }
      }
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      state.current.scrollAccum += e.deltaY * 0.006
    }
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      state.current.isDragging = true
      const t = e.touches[0]
      state.current.lastMouse = { x: t.clientX, y: t.clientY }
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const s = state.current
      if (!s.isDragging || e.touches.length > 1) return
      const t = e.touches[0]
      s.targetVel.x -= (t.clientX - s.lastMouse.x) * 0.02
      s.targetVel.y += (t.clientY - s.lastMouse.y) * 0.02
      s.lastMouse = { x: t.clientX, y: t.clientY }
    }
    const onTouchEnd = () => { state.current.isDragging = false }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [gl])

  useFrame(() => {
    const s = state.current

    const { forward, backward, left, right, up, down } = getKeys() as any
    if (forward) s.targetVel.z -= KEYBOARD_SPEED
    if (backward) s.targetVel.z += KEYBOARD_SPEED
    if (left) s.targetVel.x -= KEYBOARD_SPEED
    if (right) s.targetVel.x += KEYBOARD_SPEED
    if (down) s.targetVel.y -= KEYBOARD_SPEED
    if (up) s.targetVel.y += KEYBOARD_SPEED

    if (!s.isDragging) {
      const zoomFactor = clamp(s.basePos.z / 50, 0.3, 2)
      const driftAmount = 8 * zoomFactor
      s.drift.x = lerp(s.drift.x, s.mouse.x * driftAmount, 0.1)
      s.drift.y = lerp(s.drift.y, s.mouse.y * driftAmount, 0.1)
    } else {
      s.drift.x = lerp(s.drift.x, 0, 0.1)
      s.drift.y = lerp(s.drift.y, 0, 0.1)
    }

    s.targetVel.z += s.scrollAccum
    s.scrollAccum *= 0.8

    s.targetVel.x = clamp(s.targetVel.x, -MAX_VELOCITY, MAX_VELOCITY)
    s.targetVel.y = clamp(s.targetVel.y, -MAX_VELOCITY, MAX_VELOCITY)
    s.targetVel.z = clamp(s.targetVel.z, -MAX_VELOCITY, MAX_VELOCITY)

    s.velocity.x = lerp(s.velocity.x, s.targetVel.x, VELOCITY_LERP)
    s.velocity.y = lerp(s.velocity.y, s.targetVel.y, VELOCITY_LERP)
    s.velocity.z = lerp(s.velocity.z, s.targetVel.z, VELOCITY_LERP)

    s.basePos.x += s.velocity.x
    s.basePos.y += s.velocity.y
    s.basePos.z += s.velocity.z

    camera.position.set(s.basePos.x + s.drift.x, s.basePos.y + s.drift.y, s.basePos.z)

    s.targetVel.x *= VELOCITY_DECAY
    s.targetVel.y *= VELOCITY_DECAY
    s.targetVel.z *= VELOCITY_DECAY

    const cx = Math.round(s.basePos.x / CHUNK_SIZE)
    const cy = Math.round(s.basePos.y / CHUNK_SIZE)
    const cz = 0

    const visible: typeof chunkList = []
    for (const ch of chunkList) {
      const dx = Math.abs(ch.cx - cx)
      const dy = Math.abs(ch.cy - cy)
      const dz = Math.abs(ch.cz - cz)
      if (dx <= RENDER_DISTANCE && dy <= RENDER_DISTANCE && dz <= RENDER_DISTANCE) {
        visible.push(ch)
      }
    }
    setVisibleChunks(visible)
  })

  return (
    <>
      {visibleChunks.map((ch) => (
        <group key={`${ch.cx},${ch.cy},${ch.cz}`}>
          {ch.planes.map((p) => (
            <ImagePlane key={p.src} src={p.src} x={p.x} y={p.y} z={p.z} onClick={onOpen} />
          ))}
        </group>
      ))}
    </>
  )
}

export default function Scene({ images }: Props) {
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

  if (!images.length) return null

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', inset: 0 }}>
      <KeyboardControls map={KEYBOARD_MAP}>
        <Canvas
          camera={{ position: [0, 0, INITIAL_CAMERA_Z], fov: 60, near: 1, far: 500 }}
          dpr={Math.min(window.devicePixelRatio || 1, 1.5)}
          flat
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <color attach="background" args={['#000']} />
          <fog attach="fog" args={['#000', FOG_NEAR, FOG_FAR]} />
          <SceneController images={images} onOpen={handleOpen} />
        </Canvas>
      </KeyboardControls>
      <Lightbox src={lightboxSrc} onClose={handleClose} onPrev={handlePrev} onNext={handleNext} />
    </div>
  )
}
