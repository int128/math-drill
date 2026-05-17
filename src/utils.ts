import type { KukuMode, KukuPair, Level, Problem } from './types'

export const LEVELS: Level[] = [
  { difficulty: 'easy', operator: '+', label: 'かんたん たしざん', icon: '⭐' },
  { difficulty: 'hard', operator: '+', label: 'むずかしい たしざん', icon: '🌟' },
  { difficulty: 'easy', operator: '-', label: 'かんたん ひきざん', icon: '⭐' },
  { difficulty: 'hard', operator: '-', label: 'むずかしい ひきざん', icon: '🌟' },
  { difficulty: 'easy', operator: '*', label: 'かんたん かけざん', icon: '⭐' },
  { difficulty: 'hard', operator: '*', label: 'むずかしい かけざん', icon: '🌟' },
]

export const TOTAL_QUESTIONS = 10
export const KUKU_TOTAL = 9

export const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'] as const

export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateProblem(level: Level): Problem {
  const { difficulty, operator } = level
  if (operator === '+') {
    if (difficulty === 'easy') {
      const num1 = randInt(1, 9)
      const num2 = randInt(1, 9)
      return { num1, num2, operator, answer: num1 + num2 }
    }
    const num1 = randInt(10, 99)
    const num2 = randInt(10, 99)
    return { num1, num2, operator, answer: num1 + num2 }
  }
  if (operator === '-') {
    // Subtraction: ensure result >= 1
    if (difficulty === 'easy') {
      const num1 = randInt(2, 9)
      const num2 = randInt(1, num1 - 1)
      return { num1, num2, operator, answer: num1 - num2 }
    }
    const num1 = randInt(20, 99)
    const num2 = randInt(10, num1 - 1)
    return { num1, num2, operator, answer: num1 - num2 }
  }
  if (operator === '*') {
    if (difficulty === 'easy') {
      const num1 = randInt(2, 9)
      const num2 = randInt(2, 9)
      return { num1, num2, operator, answer: num1 * num2 }
    }
    const num1 = randInt(11, 99)
    const num2 = randInt(2, 9)
    return { num1, num2, operator, answer: num1 * num2 }
  }
  throw new Error(`unsupported operator: ${operator}`)
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getNumBoxes(level: Level): number {
  return level.difficulty === 'hard' ? 3 : 2
}

export function splitDigits(num: number, N: number): string[] {
  const s = String(num)
  return Array.from({ length: N }, (_, i) => {
    const pos = s.length - (N - i)
    return pos >= 0 ? s[pos] : ''
  })
}

export function generateKukuPairs(dan: number, mode: KukuMode): KukuPair[] {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const seq = mode === 'order' ? nums : shuffle(nums)
  return seq.map((n2) => ({ num1: dan, num2: n2 }))
}

export interface HintLine {
  label: string
  detail: string
  pos: number
}

const POSITION_LABELS = ['いちのくらい', 'じゅうのくらい', 'ひゃくのくらい'] as const

/**
 * Returns per-column calculation hints for hissan wrong-answer feedback.
 * Lines are in solving order (ones first, then tens, then hundreds).
 */
export function getHintLines(problem: Problem, numDigits: number): HintLine[] {
  const { num1, num2, operator } = problem
  const lines: HintLine[] = []

  if (operator === '+') {
    let carry = 0
    for (let pos = 0; pos < numDigits; pos++) {
      const d1 = Math.floor(num1 / 10 ** pos) % 10
      const d2 = Math.floor(num2 / 10 ** pos) % 10
      if (d1 === 0 && d2 === 0 && carry === 0) continue
      const sum = d1 + d2 + carry
      const newCarry = Math.floor(sum / 10)
      let detail: string
      if (d1 === 0 && d2 === 0) {
        detail = `くりあがりは いくつ？`
      } else {
        const base = carry > 0 ? `${d1} ＋ ${d2} ＋ ${carry}（くりあがり）＝ ？` : `${d1} ＋ ${d2} ＝ ？`
        detail = newCarry > 0 ? `${base}（くりあがりあり）` : base
      }
      lines.push({ label: POSITION_LABELS[pos], detail, pos })
      carry = newCarry
    }
  } else if (operator === '-') {
    let borrow = 0
    for (let pos = 0; pos < numDigits; pos++) {
      const d1 = Math.floor(num1 / 10 ** pos) % 10
      const d2 = Math.floor(num2 / 10 ** pos) % 10
      if (d1 === 0 && d2 === 0 && borrow === 0) continue
      const effectiveD1 = d1 - borrow
      const needsBorrow = effectiveD1 < d2
      let detail: string
      if (needsBorrow) {
        detail = `${effectiveD1} は ${d2} より少ないので、くりさがり。 ${effectiveD1 + 10} − ${d2} ＝ ？`
      } else if (borrow > 0) {
        detail = `${d1} − 1（くりさがり）− ${d2} ＝ ？`
      } else {
        detail = `${d1} − ${d2} ＝ ？`
      }
      lines.push({ label: POSITION_LABELS[pos], detail, pos })
      borrow = needsBorrow ? 1 : 0
    }
  } else if (operator === '*') {
    // hard mode: 2-digit × 1-digit
    let carry = 0
    for (let pos = 0; pos < numDigits; pos++) {
      const d1 = Math.floor(num1 / 10 ** pos) % 10
      if (d1 === 0 && carry === 0) continue
      const product = d1 * num2 + carry
      const newCarry = Math.floor(product / 10)
      let detail: string
      if (d1 === 0) {
        detail = `くりあがりは いくつ？`
      } else {
        const base = carry > 0 ? `${d1} × ${num2} ＋ ${carry}（くりあがり）＝ ？` : `${d1} × ${num2} ＝ ？`
        detail = newCarry > 0 ? `${base}（くりあがりあり）` : base
      }
      lines.push({ label: POSITION_LABELS[pos], detail, pos })
      carry = newCarry
    }
  }

  return lines
}
