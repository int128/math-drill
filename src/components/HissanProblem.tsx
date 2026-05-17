import type { Phase, Problem } from '../types'
import { splitDigits } from '../utils'

interface HissanProblemProps {
  problem: Problem
  digits: string[]
  filledCount: number
  phase: Phase
}

export function HissanProblem({ problem, digits, filledCount, phase }: HissanProblemProps) {
  return (
    <div className="problem-vertical">
      <div className="vrow">
        <span className="op vop-hidden">＋</span>
        <div className="digit-cells">
          {splitDigits(problem.num1, digits.length).map((d, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
            <div key={i} className="num-cell">
              {d}
            </div>
          ))}
        </div>
      </div>
      <div className="vrow">
        <span className="op">{problem.operator === '+' ? '＋' : problem.operator === '-' ? '－' : '×'}</span>
        <div className="digit-cells">
          {splitDigits(problem.num2, digits.length).map((d, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
            <div key={i} className="num-cell">
              {d}
            </div>
          ))}
        </div>
      </div>
      <div className="vline" />
      <div className="vrow">
        <span className="op vop-hidden">＋</span>
        <div className="digit-boxes-wrapper">
          <div className="digit-boxes">
            {digits.map((d, i) => {
              const isActive = filledCount < digits.length && i === digits.length - 1 - filledCount
              const boxClass = [
                'digit-box',
                d !== '' ? 'filled' : '',
                isActive ? 'active' : '',
                phase !== 'question' ? phase : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
                <div key={i} className={boxClass}>
                  {d}
                </div>
              )
            })}
          </div>
          <div className="digit-labels">
            {(digits.length === 3 ? ['ひゃく', 'じゅう', 'いち'] : ['じゅう', 'いち']).map((label, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
              <div key={i} className="digit-label">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
