interface Props {
  src: string | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function ImageLightbox({ src, onClose, onPrev, onNext }: Props) {
  if (!src) return null

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
      }}
      onClick={handleBackdrop}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      tabIndex={0}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        style={{
          position: 'absolute', top: '1rem', right: '1rem',
          width: '2.5rem', height: '2.5rem', border: 'none',
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          fontSize: '1.5rem', cursor: 'pointer', borderRadius: '50%',
          zIndex: 10001, opacity: 0.6,
        }}
      >
        &times;
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onPrev() }}
        style={{
          position: 'absolute', top: '50%', left: '1rem',
          transform: 'translateY(-50%)',
          width: '2.5rem', height: '2.5rem', border: 'none',
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          fontSize: '1.25rem', cursor: 'pointer', borderRadius: '50%',
          zIndex: 10001, opacity: 0.6,
        }}
      >
        &larr;
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onNext() }}
        style={{
          position: 'absolute', top: '50%', right: '1rem',
          transform: 'translateY(-50%)',
          width: '2.5rem', height: '2.5rem', border: 'none',
          background: 'rgba(0,0,0,0.6)', color: '#fff',
          fontSize: '1.25rem', cursor: 'pointer', borderRadius: '50%',
          zIndex: 10001, opacity: 0.6,
        }}
      >
        &rarr;
      </button>
      <div style={{ maxWidth: '95vw', maxHeight: '95vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={src} alt="" style={{ maxWidth: '100%', maxHeight: '95vh', objectFit: 'contain', cursor: 'default' }} />
      </div>
    </div>
  )
}
