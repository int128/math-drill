import type { Difficulty, Level, Operator, Problem } from './types'

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

export function isOperator(value: unknown): value is Operator {
  return value === '+' || value === '-'
}

export function isDifficulty(value: unknown): value is Difficulty {
  return value === 'easy' || value === 'hard'
}
