export type Operator = '+' | '-'
export type Difficulty = 'easy' | 'hard'
export type Phase = 'question' | 'correct' | 'wrong'

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

export const LEVELS: Level[] = [
  { difficulty: 'easy', operator: '+', label: 'かんたん たしざん', icon: '⭐' },
  { difficulty: 'easy', operator: '-', label: 'かんたん ひきざん', icon: '⭐' },
  { difficulty: 'hard', operator: '+', label: 'むずかしい たしざん', icon: '🌟' },
  { difficulty: 'hard', operator: '-', label: 'むずかしい ひきざん', icon: '🌟' },
]

export const TOTAL_QUESTIONS = 10
