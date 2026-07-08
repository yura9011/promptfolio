import { TextureLoader, LinearMipmapLinearFilter, LinearFilter, SRGBColorSpace, Texture } from 'three'

const textureCache = new Map<string, Texture>()
const loadCallbacks = new Map<string, Set<(tex: Texture) => void>>()
const loader = new TextureLoader()

function isTextureLoaded(tex: Texture): boolean {
  const img = tex.image as HTMLImageElement | undefined
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0
}

export function getTexture(url: string, onLoad?: (texture: Texture) => void): Texture {
  const existing = textureCache.get(url)

  if (existing) {
    if (onLoad) {
      if (isTextureLoaded(existing)) {
        onLoad(existing)
      } else {
        loadCallbacks.get(url)?.add(onLoad)
      }
    }
    return existing
  }

  const callbacks = new Set<(tex: Texture) => void>()
  if (onLoad) callbacks.add(onLoad)
  loadCallbacks.set(url, callbacks)

  const texture = loader.load(
    url,
    (tex) => {
      tex.minFilter = LinearMipmapLinearFilter
      tex.magFilter = LinearFilter
      tex.generateMipmaps = true
      tex.anisotropy = 4
      tex.colorSpace = SRGBColorSpace
      tex.needsUpdate = true

      loadCallbacks.get(url)?.forEach((cb) => {
        try { cb(tex) } catch (err) { console.error('Texture callback failed:', err) }
      })
      loadCallbacks.delete(url)
    },
    undefined,
    (err) => console.error('Texture load failed:', url, err)
  )

  textureCache.set(url, texture)
  return texture
}
