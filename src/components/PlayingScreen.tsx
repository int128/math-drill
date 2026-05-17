import { useCallback, useEffect, useState } from 'react'
import type { Level, Phase, Problem } from '../types'
import { generateProblem, getNumBoxes, KUKU_TOTAL, TOTAL_QUESTIONS } from '../utils'
import { HissanProblem } from './HissanProblem'
import { KukuProblem } from './KukuProblem'
import { Numpad } from './Numpad'

type PlayingScreenProps =
  | { mode: 'hissan'; level: Level; onClear: () => void; onBack: () => void }
  | { mode: 'kuku'; dan: number; sequence: number[]; onClear: () => void; onBack: () => void }

export function PlayingScreen(props: PlayingScreenProps) {
  const { onClear, onBack } = props
  const isKukuMode = props.mode === 'kuku'
  const totalQ = isKukuMode ? KUKU_TOTAL : TOTAL_QUESTIONS

  const [problem, setProblem] = useState<Problem>(() => {
    if (props.mode === 'kuku') {
      return { num1: props.dan, num2: props.sequence[0], operator: '*', answer: props.dan * props.sequence[0] }
    }
    return generateProblem(props.level)
  })
  const [digits, setDigits] = useState<string[]>(() =>
    props.mode === 'hissan' ? Array(getNumBoxes(props.level)).fill('') : [],
  )
  const [filledCount, setFilledCount] = useState(0)
  const [kukuInput, setKukuInput] = useState('')
  const [phase, setPhase] = useState<Phase>('question')
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)

  // Auto-transition after feedback
  useEffect(() => {
    if (phase === 'correct') {
      const t = setTimeout(() => {
        if (correctCount >= totalQ) {
          onClear()
        } else {
          if (props.mode === 'kuku') {
            setProblem({
              num1: props.dan,
              num2: props.sequence[correctCount],
              operator: '*',
              answer: props.dan * props.sequence[correctCount],
            })
            setKukuInput('')
          } else {
            setProblem(generateProblem(props.level))
            setDigits(Array(getNumBoxes(props.level)).fill(''))
          }
          setFilledCount(0)
          setPhase('question')
        }
      }, 1500)
      return () => clearTimeout(t)
    }
    if (phase === 'wrong') {
      const t = setTimeout(() => {
        if (props.mode === 'kuku') {
          setKukuInput('')
        } else {
          setDigits(Array(getNumBoxes(props.level)).fill(''))
        }
        setFilledCount(0)
        setPhase('question')
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [phase, correctCount, totalQ, onClear, props])

  const handleDigit = useCallback(
    (d: string) => {
      if (phase !== 'question') return
      if (isKukuMode) {
        if (kukuInput.length >= 2) return
        setKukuInput((prev) => prev + d)
        return
      }
      if (filledCount >= digits.length) return
      const idx = digits.length - 1 - filledCount
      const next = [...digits]
      next[idx] = d
      setDigits(next)
      setFilledCount(filledCount + 1)
    },
    [phase, isKukuMode, kukuInput, filledCount, digits],
  )

  const handleDelete = useCallback(() => {
    if (phase !== 'question') return
    if (isKukuMode) {
      setKukuInput((prev) => prev.slice(0, -1))
      return
    }
    if (filledCount === 0) return
    const idx = digits.length - filledCount
    const next = [...digits]
    next[idx] = ''
    setDigits(next)
    setFilledCount(filledCount - 1)
  }, [phase, isKukuMode, filledCount, digits])

  const handleSubmit = useCallback(() => {
    if (phase !== 'question') return
    if (isKukuMode) {
      if (kukuInput.length === 0) return
      const num = parseInt(kukuInput, 10)
      if (num === problem.answer) {
        setCorrectCount((c) => c + 1)
        setStreak((s) => s + 1)
        setPhase('correct')
      } else {
        setStreak(0)
        setPhase('wrong')
      }
      return
    }
    if (filledCount === 0) return
    const num = parseInt(digits.filter((d) => d !== '').join(''), 10)
    if (num === problem.answer) {
      setCorrectCount((c) => c + 1)
      setStreak((s) => s + 1)
      setPhase('correct')
    } else {
      setStreak(0)
      setPhase('wrong')
    }
  }, [phase, isKukuMode, kukuInput, filledCount, digits, problem.answer])

  // Keyboard support for PC users
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key)
      else if (e.key === 'Backspace') handleDelete()
      else if (e.key === 'Enter') handleSubmit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleDigit, handleDelete, handleSubmit])

  const cardClass = ['problem-card', phase !== 'question' ? phase : ''].filter(Boolean).join(' ')
  const feedbackClass = ['feedback', phase !== 'question' ? 'visible' : '', phase !== 'question' ? phase : '']
    .filter(Boolean)
    .join(' ')
  const canDelete = isKukuMode ? kukuInput.length > 0 : filledCount > 0
  const canSubmit = isKukuMode ? kukuInput.length > 0 : filledCount > 0

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">けいさん れんしゅう</h1>
        <div className="score-area">
          <span className="score-badge">
            🌟 {correctCount} / {totalQ} もん
          </span>
          {streak >= 3 && (
            <span className="streak-badge" key={streak}>
              🔥 {streak} れんぞく！
            </span>
          )}
        </div>
        <div className="progress-area">
          {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
            <div key={i} className={`progress-dot${i < correctCount ? ' filled' : ''}`} />
          ))}
        </div>
      </header>

      <main className="main">
        <div className={cardClass}>
          <div className={feedbackClass}>{phase === 'correct' ? 'せいかい！🎉' : 'ちがうよ！もういちど 🤔'}</div>
          {isKukuMode ? (
            <KukuProblem problem={problem} kukuInput={kukuInput} phase={phase} />
          ) : (
            <HissanProblem problem={problem} digits={digits} filledCount={filledCount} phase={phase} />
          )}
        </div>

        <Numpad
          phase={phase}
          canDelete={canDelete}
          canSubmit={canSubmit}
          onDigit={handleDigit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
        />

        <button type="button" className="back-btn" onClick={onBack}>
          ← もどる
        </button>
      </main>
    </div>
  )
}
