import { useMemo } from 'react'
import type { KukuTableHole, Phase } from '../types'

interface KukuTableChallengeProps {
  holes: KukuTableHole[]
  filledAnswers: Record<string, string>
  activeInput: string
  currentIndex: number
  phase: Phase
}

function cellKey(num1: number, num2: number): string {
  return `${num1}-${num2}`
}

export function KukuTableChallenge({
  holes,
  filledAnswers,
  activeInput,
  currentIndex,
  phase,
}: KukuTableChallengeProps) {
  const holeSet = useMemo(() => {
    const s = new Set<string>()
    for (const h of holes) s.add(cellKey(h.num1, h.num2))
    return s
  }, [holes])

  const activeHole = holes[currentIndex]
  const activeKey = activeHole ? cellKey(activeHole.num1, activeHole.num2) : ''

  return (
    <div className="kuku-table-wrap">
      <div className="kuku-table-caption">あいている ますに こたえをいれよう！</div>
      <table className="kuku-table-grid" aria-label="九九表チャレンジ">
        <thead>
          <tr>
            <th className="kuku-table-corner" />
            {Array.from({ length: 9 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
              <th key={`head-col-${i}`} className="kuku-table-head" scope="col">
                {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 9 }, (_, rowIdx) => {
            const num1 = rowIdx + 1
            return (
              <tr key={`row-${num1}`}>
                <th className="kuku-table-head" scope="row">
                  {num1}
                </th>
                {Array.from({ length: 9 }, (_, colIdx) => {
                  const num2 = colIdx + 1
                  const key = cellKey(num1, num2)
                  const isHole = holeSet.has(key)
                  const isActive = key === activeKey
                  const filled = filledAnswers[key]
                  const value = isHole ? (filled ?? (isActive ? activeInput : '')) : String(num1 * num2)
                  const classes = [
                    'kuku-table-cell',
                    isHole ? 'hole' : 'fixed',
                    isActive ? 'active' : '',
                    filled ? 'filled' : '',
                    isActive && phase !== 'question' ? phase : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                  return (
                    <td key={`cell-${num1}-${num2}`} className={classes}>
                      {value}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
