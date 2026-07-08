import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

const KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'Space']

export default function CameraController() {
  const { camera, gl } = useThree()
  const keys = useRef(new Set<string>())
  const velocity = useRef(new Vector3())
  const targetVel = useRef(new Vector3())
  const mouse = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const scrollAccum = useRef(0)
  const basePos = useRef(new Vector3(0, 0, 20))
  const drift = useRef(new Vector3())

  useEffect(() => {
    const el = gl.domElement

    const onKeyDown = (e: KeyboardEvent) => {
      if (KEYS.includes(e.code)) e.preventDefault()
      keys.current.add(e.code)
    }
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code)

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseUp = () => { isDragging.current = false }
    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (isDragging.current) {
        const dx = e.clientX - lastMouse.current.x
        const dy = e.clientY - lastMouse.current.y
        targetVel.current.x -= dx * 0.03
        targetVel.current.y += dy * 0.03
        lastMouse.current = { x: e.clientX, y: e.clientY }
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      scrollAccum.current += e.deltaY * 0.008
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true
        lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastMouse.current.x
        const dy = e.touches[0].clientY - lastMouse.current.y
        targetVel.current.x -= dx * 0.03
        targetVel.current.y += dy * 0.03
        lastMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      }
    }
    const onTouchEnd = () => { isDragging.current = false }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mousemove', onMouseMove)
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [gl])

  useFrame(() => {
    const k = keys.current
    const speed = 0.15
    if (k.has('KeyW')) targetVel.current.y += speed
    if (k.has('KeyS')) targetVel.current.y -= speed
    if (k.has('KeyA')) targetVel.current.x -= speed
    if (k.has('KeyD')) targetVel.current.x += speed
    if (k.has('KeyQ')) targetVel.current.z += speed * 2
    if (k.has('KeyE')) targetVel.current.z -= speed * 2
    if (k.has('Space')) scrollAccum.current = -0.5

    targetVel.current.z += scrollAccum.current
    scrollAccum.current *= 0.85

    const damping = 0.85
    const accel = 0.12

    velocity.current.x += (targetVel.current.x - velocity.current.x) * accel
    velocity.current.y += (targetVel.current.y - velocity.current.y) * accel
    velocity.current.z += (targetVel.current.z - velocity.current.z) * accel

    if (!isDragging.current) {
      drift.current.x += (-drift.current.x) * 0.05
      drift.current.y += (-drift.current.y) * 0.05
    }

    basePos.current.x += velocity.current.x
    basePos.current.y += velocity.current.y
    basePos.current.z += velocity.current.z

    camera.position.x = basePos.current.x + drift.current.x
    camera.position.y = basePos.current.y + drift.current.y
    camera.position.z = basePos.current.z

    targetVel.current.multiplyScalar(damping)
    velocity.current.multiplyScalar(0.9)
  })

  return null
}
