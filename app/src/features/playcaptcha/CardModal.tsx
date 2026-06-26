import { useEffect, useRef } from 'react'
import { TOY_META, RARITY_LABEL, RARITY_COLOR, type ToyId } from '../playcaptcha/toys.ts'

/** Cierra con Escape o click fuera del contenido. */
export function CardModal({
  id,
  onClose,
}: {
  id: ToyId
  onClose: () => void
}) {
  const meta = TOY_META[id]
  const frameRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!meta) return null

  const cardNumber = `#${String(meta.pokedexNum).padStart(3, '0')}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card-frame"
        ref={frameRef}
        onClick={(e) => e.stopPropagation()}
        style={{ '--card-accent': meta.accent, '--card-bg': meta.accentSoft } as React.CSSProperties}
      >
        {/* cabecera */}
        <div className="modal-card-header">
          <div>
            <span className="modal-card-name">{meta.label}</span>
            <span className="modal-card-category">{meta.category}</span>
          </div>
          <div className="modal-card-right">
            <span className="modal-card-hp">
              <span className="modal-card-hp-label">HP</span>
              {meta.power}
            </span>
            <span
              className="modal-card-type-badge"
              style={{ background: meta.accent }}
            >
              {meta.category.replace('Pokemon ', '')}
            </span>
          </div>
        </div>

        {/* arte */}
        <div className="modal-card-art">
          <img src={meta.src} alt={meta.label} draggable={false} />
          <span className="modal-card-num">{cardNumber}</span>
        </div>

        {/* descripcion */}
        <div className="modal-card-desc">
          <p>{meta.flavorText}</p>
        </div>

        {/* footer stats */}
        <div className="modal-card-footer">
          <div className="modal-card-stat">
            <span className="modal-card-stat-val">{meta.pokedexNum}</span>
            <span className="modal-card-stat-lbl">N.º Pokédex</span>
          </div>
          <div className="modal-card-stat">
            <span className="modal-card-stat-val">{meta.power}</span>
            <span className="modal-card-stat-lbl">Poder</span>
          </div>
          <div className="modal-card-stat">
            <span
              className="modal-card-stat-val"
              style={{ color: RARITY_COLOR[meta.rarity] }}
            >
              {RARITY_LABEL[meta.rarity]}
            </span>
            <span className="modal-card-stat-lbl">Rareza</span>
          </div>
        </div>

        {/* holo overlay */}
        <div className="modal-card-holo" />

        <button className="modal-card-close" onClick={onClose} aria-label="Cerrar carta">
          ✕
        </button>
      </div>
    </div>
  )
}
