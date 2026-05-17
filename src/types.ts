export type Operator = '+' | '-' | '*'
export type Difficulty = 'easy' | 'hard'
export type AppPhase = 'select' | 'kuku-select' | 'playing' | 'clear'
export type Phase = 'question' | 'correct' | 'wrong'
export type KukuMode = 'order' | 'shuffle'

export interface Level {
  difficulty: Difficulty
  operator: Operator
  label: string
  icon: string
}

export interface Problem {
  num1: number
  num2: number
  operator: Operator
  answer: number
}
