import type { KukuMode, KukuPair, Level, Problem } from './types'

export const LEVELS: Level[] = [
  { difficulty: 'easy', operator: '+', label: 'かんたん たしざん', icon: '⭐' },
  { difficulty: 'hard', operator: '+', label: 'むずかしい たしざん', icon: '🌟' },
  { difficulty: 'easy', operator: '-', label: 'かんたん ひきざん', icon: '⭐' },
  { difficulty: 'hard', operator: '-', label: 'むずかしい ひきざん', icon: '🌟' },
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

export function generateAllKukuPairs(): KukuPair[] {
  const all: KukuPair[] = []
  for (let n1 = 1; n1 <= 9; n1++) {
    for (let n2 = 1; n2 <= 9; n2++) {
      all.push({ num1: n1, num2: n2 })
    }
  }
  return shuffle(all)
}
