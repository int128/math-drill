import type { Phase, Problem } from '../types'

interface KukuProblemProps {
  problem: Problem
  kukuInput: string
  phase: Phase
}

export function KukuProblem({ problem, kukuInput, phase }: KukuProblemProps) {
  return (
    <div className="kuku-equation">
      <span className="kuku-eq-num">{problem.num1}</span>
      <span className="kuku-eq-sym">×</span>
      <span className="kuku-eq-num">{problem.num2}</span>
      <span className="kuku-eq-sym">=</span>
      <div
        className={['kuku-answer-box', kukuInput !== '' ? 'filled' : 'active', phase !== 'question' ? phase : '']
          .filter(Boolean)
          .join(' ')}
      >
        {kukuInput}
      </div>
    </div>
  )
}
