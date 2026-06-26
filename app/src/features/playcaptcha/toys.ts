/* Catalogo de juguetes — generado desde kantoPokedex.ts.
   Cada Pokemon tiene: sprite oficial, sprite HOME (512px), cry OGG, showdown GIF. */

import { KANTO, TYPE_COLOR, type KantoEntry, type Rarity } from './kantoPokedex.ts'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export type { Rarity }
export { RARITY_LABEL, RARITY_ORDER } from './kantoPokedex.ts'

export const RARITY_COLOR: Record<Rarity, string> = {
  comun: '#8e8e93',
  raro: '#30d158',
  epico: '#bf5af2',
  legendario: '#ffd60a',
}

const artwork = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
const homeSprite = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`
const showdownGif = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`
const cryOgg = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`

/** ID de Pokedex (1-151 para Kanto). */
export type ToyId = number

export interface ToyMeta {
  label: string
  accent: string
  accentSoft: string
  src: string
  /** Sprite HOME 512x512 — para la carta cuando se hace hover. */
  homeSrc: string
  /** GIF animado de Showdown — para la carta al capturar. */
  showdownSrc: string
  /** Sonido OGG del grito del Pokemon. */
  cryUrl: string
  category: string
  flavorText: string
  power: number
  rarity: Rarity
  pokedexNum: number
  /** Peso relativo (0-1): cuanto mas pesado, mas tiembla la garra al llevarlo. */
  weight: number
  /** Probabilidad de que la garra tiemble fuerte al cargarlo (base, 0-0.15). */
  tremorChance: number
}

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function buildMeta(e: KantoEntry): ToyMeta {
  const accent = TYPE_COLOR[e.type] || '#8e8e93'
  // peso relativo basado en el poder: un Bulbasaur (318) es ligero, un Mewtwo (680) pesa
  const weight = clamp(e.power / 720, 0.28, 1)
  // los legendarios y epicos tiemblan mas: factor basado en rareza
  const tremorBase = { comun: 0.03, raro: 0.06, epico: 0.10, legendario: 0.15 }[e.rarity]
  return {
    label: e.name,
    accent,
    accentSoft: hexToRgba(accent, 0.12),
    src: artwork(e.id),
    homeSrc: homeSprite(e.id),
    showdownSrc: showdownGif(e.id),
    cryUrl: cryOgg(e.id),
    category: `Pokemon ${e.type.charAt(0).toUpperCase() + e.type.slice(1)}`,
    flavorText: `Num. ${String(e.id).padStart(3, '0')} de la Pokedex de Kanto.`,
    power: e.power,
    rarity: e.rarity,
    pokedexNum: e.id,
    weight,
    tremorChance: tremorBase,
  }
}

const _meta = Object.fromEntries(KANTO.map((e) => [e.id, buildMeta(e)])) as Record<ToyId, ToyMeta>

export const TOY_META: Record<ToyId, ToyMeta> = _meta

/** Pool para la maquina: {toy: id, w: width-px} — w controla el tamano en la pila. */
export function buildPool(ids: ToyId[]): Array<{ toy: ToyId; w: number }> {
  return ids.map((id) => {
    const meta = TOY_META[id]
    const base = 72
    const rarityBonus = { comun: 0, raro: 4, epico: 8, legendario: 14 }[meta.rarity]
    return { toy: id, w: base + rarityBonus }
  })
}
