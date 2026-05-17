import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Phase, Problem } from '../types'
import { getHintLines, splitDigits } from '../utils'

const POS_COLORS = ['#66bb6a', '#ffa726', '#64b5f6'] as const

interface HissanProblemProps {
  problem: Problem
  digits: string[]
  filledCount: number
  phase: Phase
}

interface LineData {
  x: number
  y1: number
  y2: number
  pos: number
}

export function HissanProblem({ problem, digits, filledCount, phase }: HissanProblemProps) {
  const numDigits = digits.length
  const isHint = phase === 'hint'
  const hintLines = useMemo(() => (isHint ? getHintLines(problem, numDigits) : []), [isHint, problem, numDigits])

  const containerRef = useRef<HTMLDivElement>(null)
  const boxRefs = useRef<(HTMLDivElement | null)[]>([])
  const hintLineRefs = useRef<(HTMLDivElement | null)[]>([])
  const [svgLines, setSvgLines] = useState<LineData[]>([])

  const measureLines = useCallback(() => {
    if (!isHint || !containerRef.current) {
      setSvgLines([])
      return
    }
    const containerRect = containerRef.current.getBoundingClientRect()
    const newLines: LineData[] = []
    for (let i = 0; i < hintLines.length; i++) {
      const hl = hintLines[i]
      const boxEl = boxRefs.current[numDigits - 1 - hl.pos]
      const hintEl = hintLineRefs.current[i]
      if (!boxEl || !hintEl) continue
      const boxRect = boxEl.getBoundingClientRect()
      const hintRect = hintEl.getBoundingClientRect()
      // x: box center relative to container (shared by line and arrow)
      const x = boxRect.left + boxRect.width / 2 - containerRect.left
      // position ::before triangle so its center aligns with the box center
      const arrowLeft = boxRect.left + boxRect.width / 2 - hintRect.left - 10
      hintEl.style.setProperty('--arrow-left', `${arrowLeft}px`)
      newLines.push({
        x,
        y1: boxRect.bottom - containerRect.top,
        // -10 = tip of the upward triangle (::before top:-10px, height:10px)
        y2: hintRect.top - containerRect.top - 10,
        pos: hl.pos,
      })
    }
    setSvgLines(newLines)
  }, [isHint, hintLines, numDigits])

  useEffect(() => {
    measureLines()
    if (!containerRef.current) return
    const observer = new ResizeObserver(measureLines)
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [measureLines])

  return (
    <div className="hissan-container" ref={containerRef}>
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
                const isActive =
                  (phase === 'question' || phase === 'hint') &&
                  filledCount < numDigits &&
                  i === numDigits - 1 - filledCount
                const boxClass = [
                  'digit-box',
                  d !== '' ? 'filled' : '',
                  isActive ? 'active' : '',
                  phase === 'correct' || phase === 'wrong' ? phase : '',
                ]
                  .filter(Boolean)
                  .join(' ')
                const dataPos = isHint ? String(numDigits - 1 - i) : undefined
                const setBoxRef = (el: HTMLDivElement | null) => {
                  boxRefs.current[i] = el
                }
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
                  <div key={i} className={boxClass} data-pos={dataPos} ref={setBoxRef}>
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
          {hintLines.map((line, i) => {
            const setHintRef = (el: HTMLDivElement | null) => {
              hintLineRefs.current[i] = el
            }
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
              <div key={i} className={`hint-line hint-pos-${line.pos}`} ref={setHintRef}>
                <span className="hint-label">{line.label}：</span>
                <span className="hint-detail">{line.detail}</span>
              </div>
            )
          })}
        </div>
      )}

      {isHint && svgLines.length > 0 && (
        <svg className="hint-connector-svg" aria-hidden="true">
          {svgLines.map((l, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
            <g key={i}>
              <line
                x1={l.x}
                y1={l.y1}
                x2={l.x}
                y2={l.y2}
                stroke={POS_COLORS[l.pos]}
                strokeWidth="2.5"
                strokeDasharray="5 3"
              />
              <circle cx={l.x} cy={l.y1} r="4" fill={POS_COLORS[l.pos]} />
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}
