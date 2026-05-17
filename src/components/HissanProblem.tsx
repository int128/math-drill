import type { Phase, Problem } from '../types'
import { getHintLines, splitDigits } from '../utils'

interface HissanProblemProps {
  problem: Problem
  digits: string[]
  filledCount: number
  phase: Phase
}

export function HissanProblem({ problem, digits, filledCount, phase }: HissanProblemProps) {
  const numDigits = digits.length
  const isHint = phase === 'hint'
  const hintLines = isHint ? getHintLines(problem, numDigits) : []

  return (
    <div className="hissan-container">
      <div className="problem-vertical">
        <div className="vrow">
          <span className="op vop-hidden">＋</span>
          <div className="digit-cells">
            {splitDigits(problem.num1, numDigits).map((d, i) => (
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
            {splitDigits(problem.num2, numDigits).map((d, i) => (
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
                const isActive = phase === 'question' && filledCount < numDigits && i === numDigits - 1 - filledCount
                const boxClass = [
                  'digit-box',
                  d !== '' ? 'filled' : '',
                  isActive ? 'active' : '',
                  isHint ? 'wrong' : phase !== 'question' ? phase : '',
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
              {(numDigits === 3 ? ['ひゃく', 'じゅう', 'いち'] : ['じゅう', 'いち']).map((label, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
                <div key={i} className="digit-label">
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isHint && hintLines.length > 0 && (
        <div className="hint-lines">
          {hintLines.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
            <div key={i} className="hint-line">
              <span className="hint-label">{line.label}：</span>
              <span className="hint-detail">{line.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
