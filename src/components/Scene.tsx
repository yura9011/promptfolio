import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { KeyboardControls, useKeyboardControls } from '@react-three/drei'
import { PlaneGeometry, DoubleSide, Vector3 } from 'three'
import { clamp, lerp, hashString, seededRandom, run } from './utils'
import { getTexture } from './texture-manager'

interface Props { images: string[] }

// constants — match original exactly
const CHUNK_SIZE = 110
const RENDER_DISTANCE = 2
const CHUNK_FADE_MARGIN = 1
const DEPTH_FADE_START = 140
const DEPTH_FADE_END = 260
const INVIS_THRESHOLD = 0.01
const KEYBOARD_SPEED = 0.18
const VELOCITY_LERP = 0.16
const VELOCITY_DECAY = 0.9
const MAX_VELOCITY = 3.2
const INITIAL_CAMERA_Z = 50
const PLANE_BASE_SIZE = 14
const PLANES_PER_CHUNK = 4
const FOG_NEAR = 120
const FOG_FAR = 320

const SHARED_GEOMETRY = new PlaneGeometry(1, 1)

const KEYBOARD_MAP = [
  { name: 'forward', keys: ['w', 'W', 'ArrowUp'] },
  { name: 'backward', keys: ['s', 'S', 'ArrowDown'] },
  { name: 'left', keys: ['a', 'A', 'ArrowLeft'] },
  { name: 'right', keys: ['d', 'D', 'ArrowRight'] },
  { name: 'up', keys: ['e', 'E'] },
  { name: 'down', keys: ['q', 'Q'] },
]

const CHUNK_OFFSETS = run(() => {
  const maxDist = RENDER_DISTANCE + CHUNK_FADE_MARGIN
  const offsets: { dx: number; dy: number; dz: number; dist: number }[] = []
  for (let dx = -maxDist; dx <= maxDist; dx++) {
    for (let dy = -maxDist; dy <= maxDist; dy++) {
      for (let dz = -maxDist; dz <= maxDist; dz++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz))
        if (dist > maxDist) continue
        offsets.push({ dx, dy, dz, dist })
      }
    }
  }
  return offsets
})

type PlaneData = {
  id: string
  src: string
  position: Vector3
  scale: Vector3
}

type ChunkData = {
  key: string
  cx: number
  cy: number
  cz: number
}

const MAX_PLANE_CACHE = 256
const planeCache = new Map<string, PlaneData[]>()

function generatePlanes(cx: number, cy: number, cz: number, allImages: string[]): PlaneData[] {
  const planes: PlaneData[] = []
  const seed = hashString(`${cx},${cy},${cz}`)

  const globalStart = (cx + 5) * 10000 + (cy + 5) * 100 + (cz + 5)
  for (let i = 0; i < PLANES_PER_CHUNK; i++) {
    const imgIdx = (globalStart + i) % allImages.length
    const s = seed + i * 1000
    const r = (n: number) => seededRandom(s + n)
    const size = PLANE_BASE_SIZE + r(4) * 6 // 14-20

    planes.push({
      id: `${cx},${cy},${cz},${i}`,
      src: allImages[imgIdx],
      position: new Vector3(
        cx * CHUNK_SIZE + r(0) * CHUNK_SIZE,
        cy * CHUNK_SIZE + r(1) * CHUNK_SIZE,
        cz * CHUNK_SIZE + r(2) * CHUNK_SIZE,
      ),
      scale: new Vector3(size, size, 1),
    })
  }

  return planes
}

function getPlanesCached(cx: number, cy: number, cz: number, allImages: string[]): PlaneData[] {
  const key = `${cx},${cy},${cz}`
  const cached = planeCache.get(key)
  if (cached) {
    planeCache.delete(key)
    planeCache.set(key, cached)
    return cached
  }

  const planes = generatePlanes(cx, cy, cz, allImages)
  planeCache.set(key, planes)
  while (planeCache.size > MAX_PLANE_CACHE) {
    const first = planeCache.keys().next().value as string | undefined
    if (!first) break
    planeCache.delete(first)
  }
  return planes
}

// --- ImagePlane ---

function ImagePlane({ src, position, scale, onClick }: {
  src: string
  position: Vector3
  scale: Vector3
  onClick: (src: string) => void
}) {
  const meshRef = useRef<any>(null)
  const materialRef = useRef<any>(null)
  const localState = useRef({ opacity: 0, ready: false })
  const [texture, setTexture] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const state = localState.current
    state.ready = false
    state.opacity = 0
    setIsReady(false)

    const mat = materialRef.current
    if (mat) {
      mat.opacity = 0
      mat.depthWrite = false
      mat.map = null
    }

    const tex = getTexture(src, () => {
      state.ready = true
      setIsReady(true)
    })
    setTexture(tex)
  }, [src])

  useEffect(() => {
    const mat = materialRef.current
    const mesh = meshRef.current
    if (!mat || !mesh || !texture || !isReady) return

    const img = texture.image as HTMLImageElement
    const aspect = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 1

    mat.map = texture
    mat.opacity = localState.current.opacity
    mat.depthWrite = localState.current.opacity >= 1

    const s = scale.clone()
    s.x = s.y * aspect
    mesh.scale.copy(s)
  }, [texture, isReady, scale])

  useFrame(({ camera }) => {
    const mat = materialRef.current
    const mesh = meshRef.current
    const state = localState.current
    if (!mat || !mesh) return

    const dx = Math.abs(position.x - camera.position.x)
    const dy = Math.abs(position.y - camera.position.y)
    const dz = Math.abs(position.z - camera.position.z)
    const dist = Math.max(dx, dy, dz)
    const absDepth = Math.abs(position.z - camera.position.z)

    const gridFade = dist <= RENDER_DISTANCE * CHUNK_SIZE ? 1
      : Math.max(0, 1 - (dist - RENDER_DISTANCE * CHUNK_SIZE) / Math.max(CHUNK_FADE_MARGIN * CHUNK_SIZE, 0.0001))

    const depthFade = absDepth <= DEPTH_FADE_START ? 1
      : Math.max(0, 1 - (absDepth - DEPTH_FADE_START) / Math.max(DEPTH_FADE_END - DEPTH_FADE_START, 0.0001))

    const target = Math.min(gridFade, depthFade * depthFade)

    state.opacity = target < INVIS_THRESHOLD && state.opacity < INVIS_THRESHOLD
      ? 0
      : lerp(state.opacity, target, 0.18)

    const isFullyOpaque = state.opacity > 0.99
    mat.opacity = isFullyOpaque ? 1 : state.opacity
    mat.depthWrite = isFullyOpaque
    mesh.visible = state.opacity > INVIS_THRESHOLD
  })

  if (!texture || !isReady) return null

  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={SHARED_GEOMETRY}
      visible={false}
      onClick={(e) => { e.stopPropagation(); onClick(src) }}
    >
      <meshBasicMaterial
        ref={materialRef}
        transparent
        opacity={0}
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  )
}

// --- Chunk ---

function Chunk({ cx, cy, cz, allImages, onClick }: {
  cx: number
  cy: number
  cz: number
  allImages: string[]
  onClick: (src: string) => void
}) {
  const [planes, setPlanes] = useState<PlaneData[] | null>(null)

  useEffect(() => {
    let canceled = false
    const run = () => { if (!canceled) setPlanes(getPlanesCached(cx, cy, cz, allImages)) }

    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(run, { timeout: 100 })
      return () => { canceled = true; cancelIdleCallback(id) }
    }

    const id = setTimeout(run, 0)
    return () => { canceled = true; clearTimeout(id) }
  }, [cx, cy, cz, allImages])

  if (!planes) return null

  return (
    <group>
      {planes.map((p) => (
        <ImagePlane key={p.id} src={p.src} position={p.position} scale={p.scale} onClick={onClick} />
      ))}
    </group>
  )
}

// --- Controller ---

type ControllerState = {
  velocity: { x: number; y: number; z: number }
  targetVel: { x: number; y: number; z: number }
  basePos: { x: number; y: number; z: number }
  drift: { x: number; y: number }
  mouse: { x: number; y: number }
  lastMouse: { x: number; y: number }
  scrollAccum: number
  isDragging: boolean
  lastChunkKey: string
  lastChunkUpdate: number
  pendingChunk: { cx: number; cy: number; cz: number } | null
}

function createInitialState(): ControllerState {
  return {
    velocity: { x: 0, y: 0, z: 0 },
    targetVel: { x: 0, y: 0, z: 0 },
    basePos: { x: 0, y: 0, z: INITIAL_CAMERA_Z },
    drift: { x: 0, y: 0 },
    mouse: { x: 0, y: 0 },
    lastMouse: { x: 0, y: 0 },
    scrollAccum: 0,
    isDragging: false,
    lastChunkKey: '',
    lastChunkUpdate: 0,
    pendingChunk: null,
  }
}

function getChunkUpdateThrottle(isZooming: boolean, zoomSpeed: number): number {
  if (zoomSpeed > 1) return 500
  if (isZooming) return 400
  return 100
}

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0

function SceneController({ allImages, onOpen }: {
  allImages: string[]
  onOpen: (src: string) => void
}) {
  const { camera, gl } = useThree()
  const [, getKeys] = useKeyboardControls()
  const state = useRef<ControllerState>(createInitialState())
  const [chunks, setChunks] = useState<ChunkData[]>([])

  useEffect(() => {
    const canvas = gl.domElement
    const s = state.current
    canvas.style.cursor = 'grab'
    const setCursor = (c: string) => { canvas.style.cursor = c }

    const onMouseDown = (e: MouseEvent) => {
      s.isDragging = true
      s.lastMouse = { x: e.clientX, y: e.clientY }
      setCursor('grabbing')
    }
    const onMouseUp = () => {
      s.isDragging = false
      setCursor('grab')
    }
    const onMouseMove = (e: MouseEvent) => {
      s.mouse = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1 }
      if (s.isDragging) {
        s.targetVel.x -= (e.clientX - s.lastMouse.x) * 0.025
        s.targetVel.y += (e.clientY - s.lastMouse.y) * 0.025
        s.lastMouse = { x: e.clientX, y: e.clientY }
      }
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      s.scrollAccum += e.deltaY * 0.006
    }
    const getTouchDist = (touches: Touch[]) => {
      if (touches.length < 2) return 0
      const [t1, t2] = touches
      return Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2)
    }
    let lastTouches: Touch[] = []
    let lastTouchDist = 0

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      lastTouches = Array.from(e.touches) as Touch[]
      lastTouchDist = getTouchDist(lastTouches)
      setCursor('grabbing')
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touches = Array.from(e.touches) as Touch[]
      if (touches.length === 1 && lastTouches.length >= 1) {
        const [touch] = touches
        const [last] = lastTouches
        s.targetVel.x -= (touch.clientX - last.clientX) * 0.02
        s.targetVel.y += (touch.clientY - last.clientY) * 0.02
      } else if (touches.length === 2 && lastTouchDist > 0) {
        const dist = getTouchDist(touches)
        s.scrollAccum += (lastTouchDist - dist) * 0.006
        lastTouchDist = dist
      }
      lastTouches = touches
    }
    const onTouchEnd = (e: TouchEvent) => {
      lastTouches = Array.from(e.touches) as Touch[]
      lastTouchDist = getTouchDist(lastTouches)
      setCursor('grab')
    }

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
    const now = performance.now()

    const { forward, backward, left, right, up, down } = getKeys() as any
    if (forward) s.targetVel.z -= KEYBOARD_SPEED
    if (backward) s.targetVel.z += KEYBOARD_SPEED
    if (left) s.targetVel.x -= KEYBOARD_SPEED
    if (right) s.targetVel.x += KEYBOARD_SPEED
    if (down) s.targetVel.y -= KEYBOARD_SPEED
    if (up) s.targetVel.y += KEYBOARD_SPEED

    // Drift: freeze during drag, lerp to 0 on touch, follow mouse on desktop
    const isZooming = Math.abs(s.velocity.z) > 0.05
    const zoomFactor = clamp(s.basePos.z / 50, 0.3, 2)
    const driftAmount = 8 * zoomFactor
    const driftLerp = isZooming ? 0.2 : 0.12

    if (s.isDragging) {
      // freeze drift
    } else if (isTouchDevice()) {
      s.drift.x = lerp(s.drift.x, 0, driftLerp)
      s.drift.y = lerp(s.drift.y, 0, driftLerp)
    } else {
      s.drift.x = lerp(s.drift.x, s.mouse.x * driftAmount, driftLerp)
      s.drift.y = lerp(s.drift.y, s.mouse.y * driftAmount, driftLerp)
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

    // Chunk tracking
    const cx = Math.floor(s.basePos.x / CHUNK_SIZE)
    const cy = Math.floor(s.basePos.y / CHUNK_SIZE)
    const cz = Math.floor(s.basePos.z / CHUNK_SIZE)
    const key = `${cx},${cy},${cz}`

    if (key !== s.lastChunkKey) {
      s.pendingChunk = { cx, cy, cz }
      s.lastChunkKey = key
    }

    const throttleMs = getChunkUpdateThrottle(isZooming, Math.abs(s.velocity.z))
    if (s.pendingChunk && now - s.lastChunkUpdate >= throttleMs) {
      const { cx: ucx, cy: ucy, cz: ucz } = s.pendingChunk
      s.pendingChunk = null
      s.lastChunkUpdate = now

      setChunks(CHUNK_OFFSETS.map((o) => ({
        key: `${ucx + o.dx},${ucy + o.dy},${ucz + o.dz}`,
        cx: ucx + o.dx,
        cy: ucy + o.dy,
        cz: ucz + o.dz,
      })))
    }
  })

  // Initialize chunks on mount
  useEffect(() => {
    state.current.basePos = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
    setChunks(CHUNK_OFFSETS.map((o) => ({
      key: `${o.dx},${o.dy},${o.dz}`,
      cx: o.dx,
      cy: o.dy,
      cz: o.dz,
    })))
  }, [])

  return (
    <>
      {chunks.map((ch) => (
        <Chunk key={ch.key} cx={ch.cx} cy={ch.cy} cz={ch.cz} allImages={allImages} onClick={onOpen} />
      ))}
    </>
  )
}

// --- Lightbox ---

function Lightbox({ src, onClose, onPrev, onNext }: {
  src: string | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
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

// --- Main Scene ---

function SceneInner({ images }: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const allImages = useMemo(() => images, [images])
  const currentIndex = lightboxSrc ? allImages.indexOf(lightboxSrc) : -1

  const handleOpen = useCallback((src: string) => setLightboxSrc(src), [])
  const handleClose = useCallback(() => setLightboxSrc(null), [])
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setLightboxSrc(allImages[currentIndex - 1])
  }, [currentIndex, allImages])
  const handleNext = useCallback(() => {
    if (currentIndex < allImages.length - 1) setLightboxSrc(allImages[currentIndex + 1])
  }, [currentIndex, allImages])

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
          <SceneController allImages={allImages} onOpen={handleOpen} />
        </Canvas>
      </KeyboardControls>
      <Lightbox src={lightboxSrc} onClose={handleClose} onPrev={handlePrev} onNext={handleNext} />
    </div>
  )
}

export default function Scene(props: Props) {
  if (!props.images.length) return null
  return <SceneInner {...props} />
}
