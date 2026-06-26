import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ClawCaptcha } from './features/playcaptcha/ClawCaptcha.tsx'
import { TOY_META, RARITY_LABEL, RARITY_ORDER, RARITY_COLOR, buildPool, type ToyId, type Rarity } from './features/playcaptcha/toys.ts'
import { KANTO } from './features/playcaptcha/kantoPokedex.ts'
import { CardModal } from './features/playcaptcha/CardModal.tsx'
import './features/playcaptcha/clawcaptcha.css'

const POOL_SIZE = 14
const KANTO_IDS = KANTO.map((e) => e.id)

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickPool(exclude: ToyId[], size: number): ToyId[] {
  return shuffled(KANTO_IDS.filter((id) => !exclude.includes(id))).slice(0, size)
}

function pickTargetFromPool(pool: ToyId[], caught: ToyId[]): ToyId {
  const remaining = pool.filter((id) => !caught.includes(id))
  return remaining[Math.floor(Math.random() * remaining.length)]
}

/* ── bots falsos ───────────────────────────────────────────────────────── */
interface SpeedrunEntry {
  name: string
  time: number // segundos
  date: string
}

function generateBots(): SpeedrunEntry[] {
  const names = [
    'AshKetchum99', 'MistyWaterflower', 'Brock_Rocks', 'ProfOak_Lab',
    'BlueGary', 'RedMaster', 'LeafGreen', 'LtSurgeVolt',
    'ErikaBloom', 'SabrinaMind', 'KogaToxin', 'BlaineFlare',
    'GiovanniTerra', 'LoreleiIce', 'BrunoFight', 'AgathaGhost',
    'LanceDragon', 'CynthiaChamp', 'StevenStone', 'WallaceTide',
    'DawnTwinleaf', 'SerenaKalos', 'GloriaGalar', 'Nemona_Uva',
    'PennyVeve', 'ArvenChef', 'CliveFire', 'JulianaRuta',
  ]
  const now = new Date()
  // bases en segundos: bots entre 18 min y 55 min
  const minSec = 18 * 60
  const maxSec = 55 * 60

  return shuffled(names).slice(0, 18).map((name) => {
    const sec = minSec + Math.floor(Math.random() * (maxSec - minSec))
    const d = new Date(now.getTime() - Math.floor(Math.random() * 7 * 86400000))
    return {
      name,
      time: sec,
      date: d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }),
    }
  })
}

/* ── helpers ───────────────────────────────────────────────────────────── */

function fmtTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  return `${m}m ${String(s).padStart(2, '0')}s`
}

/** Icono inline de Pokeball — SVG puro, sin copyright. */
function PokeballIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="50" cy="50" r="46" fill="#ff453a" />
      <path d="M4 50a46 46 0 0 1 92 0" fill="#f2f2f7" />
      <rect x="4" y="46" width="92" height="8" fill="#1c1c1e" />
      <circle cx="50" cy="50" r="12" fill="#f2f2f7" stroke="#1c1c1e" strokeWidth="3" />
    </svg>
  )
}

function App() {
  const [captures, setCaptures] = useState<ToyId[]>(() => {
    try {
      const raw = localStorage.getItem('pokegarra_captures')
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      const valid = parsed.filter((id: unknown): id is ToyId =>
        typeof id === 'number' && id >= 1 && id <= 151 && TOY_META[id] !== undefined,
      )
      return valid
    } catch {
      return []
    }
  })
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(() => {
    try {
      return Number(localStorage.getItem('pokegarra_best')) || 0
    } catch {
      return 0
    }
  })
  const [score, setScore] = useState(() => {
    try {
      return Number(localStorage.getItem('pokegarra_score')) || 0
    } catch {
      return 0
    }
  })

  const [machinePool, setMachinePool] = useState<ToyId[]>(() => pickPool([], POOL_SIZE))
  const [target, setTarget] = useState<ToyId>(() => pickTargetFromPool(machinePool, []))

  const clawKey = useRef(0)
  const cryAudioRef = useRef<HTMLAudioElement | null>(null)
  const [selectedCard, setSelectedCard] = useState<ToyId | null>(null)

  /* ── speedrun ───────────────────────────────────── */
  const [speedrunActive, setSpeedrunActive] = useState(false)
  const [speedrunStartedAt, setSpeedrunStartedAt] = useState<number | null>(null)
  const [speedrunResult, setSpeedrunResult] = useState<number | null>(null)
  const [speedrunElapsed, setSpeedrunElapsed] = useState(0)
  const speedrunRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [bots] = useState<SpeedrunEntry[]>(() => generateBots())
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [personalBest, setPersonalBest] = useState<number | null>(() => {
    try {
      const v = localStorage.getItem('pokegarra_pb')
      return v ? Number(v) : null
    } catch {
      return null
    }
  })

  // temporizador del speedrun
  useEffect(() => {
    if (speedrunActive && speedrunStartedAt) {
      speedrunRef.current = setInterval(() => {
        const el = Math.floor((Date.now() - speedrunStartedAt) / 1000)
        setSpeedrunElapsed(el)
      }, 200)
    } else {
      if (speedrunRef.current) {
        clearInterval(speedrunRef.current)
        speedrunRef.current = null
      }
    }
    return () => {
      if (speedrunRef.current) clearInterval(speedrunRef.current)
    }
  }, [speedrunActive, speedrunStartedAt])

  // detectar si completamos los 151 durante un speedrun
  useEffect(() => {
    if (speedrunActive && captures.length === 151 && speedrunStartedAt) {
      const time = Math.floor((Date.now() - speedrunStartedAt) / 1000)
      setSpeedrunResult(time)
      setSpeedrunActive(false)
      setSpeedrunElapsed(time)
      setShowLeaderboard(true)
      if (personalBest === null || time < personalBest) {
        setPersonalBest(time)
        localStorage.setItem('pokegarra_pb', String(time))
      }
    }
  }, [captures.length, speedrunActive, speedrunStartedAt, personalBest])

  const startSpeedrun = () => {
    // resetear coleccion
    setCaptures([])
    setStreak(0)
    setScore(0)
    // mismo pool para maquina y objetivo — evitar desincronizacion
    const pool = pickPool([], POOL_SIZE)
    setMachinePool(pool)
    setTarget(pickTargetFromPool(pool, []))
    clawKey.current++
    setSpeedrunActive(true)
    setSpeedrunStartedAt(Date.now())
    setSpeedrunResult(null)
    setSpeedrunElapsed(0)
    setShowLeaderboard(false)
  }

  const cancelSpeedrun = () => {
    setSpeedrunActive(false)
    setSpeedrunStartedAt(null)
    setSpeedrunResult(null)
    setSpeedrunElapsed(0)
  }

  useEffect(() => {
    localStorage.setItem('pokegarra_captures', JSON.stringify(captures))
  }, [captures])

  useEffect(() => {
    if (bestStreak > 0) localStorage.setItem('pokegarra_best', String(bestStreak))
  }, [bestStreak])

  useEffect(() => {
    localStorage.setItem('pokegarra_score', String(score))
  }, [score])

  const caughtRarityCounts = () => {
    const counts: Record<Rarity, number> = { comun: 0, raro: 0, epico: 0, legendario: 0 }
    captures.forEach((id) => {
      const meta = TOY_META[id]
      if (!meta) return
      counts[meta.rarity]++
    })
    return counts
  }

  const remaining = KANTO_IDS.filter((id) => !captures.includes(id))

  const advanceTarget = useCallback(
    (currentCaptures: ToyId[], currentPool: ToyId[]): ToyId => {
      const remainingInPool = currentPool.filter((id) => !currentCaptures.includes(id))
      if (remainingInPool.length > 0) {
        return remainingInPool[Math.floor(Math.random() * remainingInPool.length)]
      }
      const newIds = KANTO_IDS.filter(
        (id) => !currentPool.includes(id) && !currentCaptures.includes(id),
      )
      if (newIds.length > 0) {
        const toAdd = shuffled(newIds).slice(0, Math.min(POOL_SIZE, newIds.length))
        setMachinePool((prev) => [...prev, ...toAdd])
        return toAdd[0]
      }
      return currentPool[Math.floor(Math.random() * currentPool.length)]
    },
    [],
  )

  const playCry = useCallback((id: ToyId) => {
    try {
      if (cryAudioRef.current) {
        cryAudioRef.current.pause()
        cryAudioRef.current = null
      }
      const audio = new Audio(TOY_META[id].cryUrl)
      audio.volume = 0.3
      cryAudioRef.current = audio
      audio.play().catch(() => {})
    } catch {}
  }, [])

  const handleVerify = useCallback(() => {
    const meta = TOY_META[target]
    playCry(target)
    setCaptures((prev) => {
      if (prev.includes(target)) return prev
      return [...prev, target]
    })
    setStreak((s) => {
      const next = s + 1
      setBestStreak((b) => Math.max(b, next))
      return next
    })
    setScore((s) => s + meta.power)

    const nextCaptures = [...captures, target].filter(
      (v, i, a) => a.indexOf(v) === i,
    )
    setTarget(advanceTarget(nextCaptures, machinePool))
    clawKey.current++
  }, [target, captures, machinePool, advanceTarget, playCry])

  const poolForClaw = useMemo(() => buildPool(machinePool), [machinePool])

  /** Dificultad progresiva: 1.0 al inicio, hasta ~2.4 al completar 90+ Pokemon.
      En speedrun escala un 20% mas rapido. */
  const difficulty = useMemo(() => {
    const base = 1 + (captures.length / 151) * 1.4
    const speedrunBonus = speedrunActive ? 1.2 : 1
    return Math.round(base * speedrunBonus * 100) / 100
  }, [captures.length, speedrunActive])

  const sortedBots = [...bots].sort((a, b) => a.time - b.time)

  return (
    <>
      <header className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PokeballIcon size={26} />
          <div>
            <span className="brand-kicker">Coleccion Kanto</span>
            <span className="brand-link">PokéGarra</span>
          </div>
        </div>
        <nav className="topnav" aria-label="Navegacion principal">
          {speedrunActive && (
            <span className="speedrun-timer-header">
              Reto en curso: {fmtTime(speedrunElapsed)}
            </span>
          )}
          {streak > 0 && !speedrunActive && (
            <span className="streak-badge">Racha x{streak}</span>
          )}
        </nav>
      </header>

      <main className="shell">
        <section className="game-layout">
          <aside className="panel panel--sidebar">
            {/* speedrun activo */}
            {speedrunActive && (
              <div className="speedrun-active-card">
                <div className="panel-head">
                  <span className="pill pill--speedrun">Desafio</span>
                  <h1>Captura los 151</h1>
                </div>

                <div className="speedrun-clock">
                  <span className="speedrun-clock-val">{fmtTime(speedrunElapsed)}</span>
                  <span className="speedrun-clock-lbl">tiempo transcurrido</span>
                </div>

                <div className="speedrun-progress">
                  <div className="speedrun-progress-bar">
                    <div
                      className="speedrun-progress-fill"
                      style={{ width: `${Math.round((captures.length / 151) * 100)}%` }}
                    />
                  </div>
                  <span className="speedrun-progress-label">
                    {captures.length} / 151 ({Math.round((captures.length / 151) * 100)}%)
                  </span>
                </div>

                <button className="speedrun-btn speedrun-btn--cancel" onClick={cancelSpeedrun}>
                  Cancelar reto
                </button>
              </div>
            )}

            {/* resultado speedrun */}
            {speedrunResult !== null && !speedrunActive && (
              <div className="speedrun-done-card">
                <div className="panel-head">
                  <span className="pill pill--done">Completado</span>
                  <h1>Coleccion completa!</h1>
                </div>

                <div className="speedrun-clock">
                  <span className="speedrun-clock-val speedrun-clock-val--done">
                    {fmtTime(speedrunResult)}
                  </span>
                  <span className="speedrun-clock-lbl">
                    {personalBest && speedrunResult === personalBest
                      ? 'Nuevo record personal!'
                      : 'Tiempo final'}
                  </span>
                </div>

                {personalBest !== null && (
                  <div className="pb-box">
                    <span className="pb-label">Mejor marca personal</span>
                    <span className="pb-time">{fmtTime(personalBest)}</span>
                  </div>
                )}

                <button
                  className="speedrun-btn speedrun-btn--leaderboard"
                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                >
                  {showLeaderboard ? 'Ocultar clasificacion' : 'Ver clasificacion'}
                </button>

                <button
                  className="speedrun-btn speedrun-btn--again"
                  onClick={startSpeedrun}
                >
                  Intentar otra vez
                </button>
              </div>
            )}

            {/* leaderboard */}
            {showLeaderboard && (
              <div className="leaderboard-card">
                <div className="panel-head">
                  <span className="pill pill--online">Online</span>
                  <h1>Clasificacion</h1>
                </div>

                {/* entrada personal si hay resultado */}
                {speedrunResult !== null && (
                  <div className="leaderboard-row leaderboard-row--you">
                    <span className="leaderboard-rank">—</span>
                    <span className="leaderboard-name">Tu</span>
                    <span className="leaderboard-time">{fmtTime(speedrunResult)}</span>
                  </div>
                )}

                {sortedBots.slice(0, 10).map((bot, i) => (
                  <div key={bot.name} className="leaderboard-row">
                    <span className={`leaderboard-rank${i < 3 ? ` leaderboard-rank--top${i + 1}` : ''}`}>
                      {i + 1}
                    </span>
                    <span className="leaderboard-name">{bot.name}</span>
                    <span className="leaderboard-time">{fmtTime(bot.time)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* estado normal — sin speedrun */}
            {!speedrunActive && speedrunResult === null && (
              <>
                <div className="panel-head">
                  <span className="pill pill--active">Jugando</span>
                  <h1>PokéGarra</h1>
                </div>

                <div className="stats-row">
                  <div className="stat-box">
                    <span className="stat-num">{captures.length}</span>
                    <span className="stat-label">Atrapados</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-num">{score}</span>
                    <span className="stat-label">Puntos</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-num">{bestStreak}</span>
                    <span className="stat-label">Record</span>
                  </div>
                </div>

                <div className="info-box">
                  <strong>Objetivo actual</strong>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img
                      src={TOY_META[target].src}
                      alt={TOY_META[target].label}
                      style={{ width: 32, height: 32, objectFit: 'contain' }}
                    />
                    <span style={{ fontWeight: 600 }}>{TOY_META[target].label}</span>
                    <span
                      style={{
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: RARITY_COLOR[TOY_META[target].rarity],
                      }}
                    >
                      {RARITY_LABEL[TOY_META[target].rarity]}
                    </span>
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--pk-muted)' }}>
                    Poder: {TOY_META[target].power}
                  </span>
                </div>

                <div className="info-box">
                  <strong>En maquina</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pk-muted)' }}>
                    {machinePool.length} Pokemon · {machinePool.filter((id) => !captures.includes(id)).length} quedan por atrapar
                  </span>
                </div>

                <div className="info-box">
                  <strong>Rarezas conseguidas</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pk-muted)' }}>
                    {RARITY_ORDER.map((r) => {
                      const count = caughtRarityCounts()[r]
                      return count > 0
                        ? `${RARITY_LABEL[r]}: ${count}`
                        : null
                    })
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>

                <div className="info-box">
                  <strong>Progreso Kanto</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--pk-muted)' }}>
                    {captures.length} / 151 ({remaining.length} pendientes)
                  </span>
                </div>

                <div className="info-box">
                  <strong>Dificultad</strong>
                  <span style={{ fontSize: '0.75rem', color: difficulty > 1.6 ? '#ffd60a' : 'var(--pk-muted)' }}>
                    Nivel {difficulty.toFixed(1)} · {difficulty > 1.6 ? 'Modo dificil' : difficulty > 1.2 ? 'Modo medio' : 'Modo facil'}
                  </span>
                </div>

                {/* boton de desafio speedrun */}
                <button className="speedrun-btn speedrun-btn--start" onClick={startSpeedrun}>
                  Desafio: Capturar los 151
                </button>

                {personalBest !== null && (
                  <div className="pb-box">
                    <span className="pb-label">Mejor marca personal</span>
                    <span className="pb-time">{fmtTime(personalBest)}</span>
                  </div>
                )}
              </>
            )}
          </aside>

          <section className="game-stage">
            <ClawCaptcha
              key={clawKey.current}
              target={target}
              pool={poolForClaw}
              difficulty={difficulty}
              title={speedrunActive ? 'Captura los 151!' : 'Atrapa al Pokemon correcto'}
              onVerify={handleVerify}
            />
          </section>
        </section>

        {/* cuadricula de cartas coleccionables — 151 Kanto */}
        <section className="card-section">
          <h2>Coleccion Kanto ({captures.length}/151)</h2>
          <div className="card-grid">
            {KANTO.map((entry) => {
              const id = entry.id
              const meta = TOY_META[id]
              const caught = captures.includes(id)
              return (
                <article
                  key={id}
                  className={`poke-card${caught ? ' poke-card--caught' : ' poke-card--locked'}`}
                  style={{
                    '--card-accent': meta.accent,
                    '--card-bg': meta.accentSoft,
                  } as React.CSSProperties}
                  onClick={() => caught && setSelectedCard(id)}
                >
                  <div className="poke-card-art">
                    <img
                      src={caught ? meta.src : meta.src}
                      alt={meta.label}
                      draggable={false}
                      loading="lazy"
                    />
                  </div>

                  <div className="poke-card-body">
                    <span className="poke-card-name">
                      {caught ? meta.label : '???'}
                    </span>
                    <span
                      className="poke-card-rarity"
                      style={{ color: caught ? RARITY_COLOR[meta.rarity] : '#555' }}
                    >
                      {caught ? RARITY_LABEL[meta.rarity] : 'Sin descubrir'}
                    </span>
                    <div className="poke-card-power">
                      {caught ? (
                        <>
                          <span style={{ color: meta.accent }}>{meta.power}</span>
                          <span className="poke-card-power-label">Poder</span>
                        </>
                      ) : (
                        <span className="poke-card-power-label">???</span>
                      )}
                    </div>
                  </div>

                  {!caught && (
                    <div className="poke-card-lock">
                      <span>Sin capturar</span>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      </main>

      {selectedCard && (
        <CardModal id={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  )
}

export default App
