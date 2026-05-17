import { useCallback, useEffect, useState } from 'react'
import type { KukuPair, Level, Phase, Problem } from '../types'
import { generateProblem, getNumBoxes, TOTAL_QUESTIONS } from '../utils'
import { HissanProblem } from './HissanProblem'
import { Numpad } from './Numpad'
import { SimpleProblem } from './SimpleProblem'

type PlayingScreenProps =
  | { mode: 'hissan'; level: Level; onClear: () => void; onBack: () => void }
  | { mode: 'kuku'; dan: number; pairs: KukuPair[]; onClear: () => void; onBack: () => void }

export function PlayingScreen(props: PlayingScreenProps) {
  const { onClear, onBack } = props
  const isKukuMode = props.mode === 'kuku'
  const isSimpleHissan = props.mode === 'hissan' && props.level.difficulty === 'easy'
  const isSimpleMode = isKukuMode || isSimpleHissan
  const totalQ = props.mode === 'kuku' ? props.pairs.length : TOTAL_QUESTIONS

  const [problem, setProblem] = useState<Problem>(() => {
    if (props.mode === 'kuku') {
      const { num1, num2 } = props.pairs[0]
      return { num1, num2, operator: '*', answer: num1 * num2 }
    }
    return generateProblem(props.level)
  })
  const [digits, setDigits] = useState<string[]>(() =>
    props.mode === 'hissan' && props.level.difficulty === 'hard' ? Array(getNumBoxes(props.level)).fill('') : [],
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
            const { num1, num2 } = props.pairs[correctCount]
            setProblem({ num1, num2, operator: '*', answer: num1 * num2 })
            setKukuInput('')
          } else {
            setProblem(generateProblem(props.level))
            if (isSimpleHissan) {
              setKukuInput('')
            } else {
              setDigits(Array(getNumBoxes(props.level)).fill(''))
            }
          }
          setFilledCount(0)
          setPhase('question')
        }
      }, 1500)
      return () => clearTimeout(t)
    }
    if (phase === 'wrong') {
      // Only simple mode reaches 'wrong'; hissan mode goes directly to 'hint'
      const t = setTimeout(() => {
        setKukuInput('')
        setFilledCount(0)
        setPhase('question')
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [phase, correctCount, totalQ, onClear, props, isSimpleHissan])

  const handleDigit = useCallback(
    (d: string) => {
      if (phase !== 'question') return
      if (isSimpleMode) {
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
    [phase, isSimpleMode, kukuInput, filledCount, digits],
  )

  const handleDelete = useCallback(() => {
    if (phase !== 'question') return
    if (isSimpleMode) {
      setKukuInput((prev) => prev.slice(0, -1))
      return
    }
    if (filledCount === 0) return
    const idx = digits.length - filledCount
    const next = [...digits]
    next[idx] = ''
    setDigits(next)
    setFilledCount(filledCount - 1)
  }, [phase, isSimpleMode, filledCount, digits])

  const handleSubmit = useCallback(() => {
    if (phase !== 'question') return
    if (isSimpleMode) {
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
      setPhase('hint')
    }
  }, [phase, isSimpleMode, kukuInput, filledCount, digits, problem.answer])

  const handleHintDone = useCallback(() => {
    if (props.mode === 'hissan') {
      setDigits(Array(getNumBoxes(props.level)).fill(''))
    }
    setFilledCount(0)
    setPhase('question')
  }, [props])

  // Keyboard support for PC users
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key)
      else if (e.key === 'Backspace') handleDelete()
      else if (e.key === 'Enter') {
        if (phase === 'hint') handleHintDone()
        else handleSubmit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleDigit, handleDelete, handleSubmit, phase, handleHintDone])

  const cardClass = ['problem-card', phase !== 'question' ? phase : ''].filter(Boolean).join(' ')
  const feedbackClass = ['feedback', phase !== 'question' ? 'visible' : '', phase !== 'question' ? phase : '']
    .filter(Boolean)
    .join(' ')
  const canDelete = isSimpleMode ? kukuInput.length > 0 : filledCount > 0
  const canSubmit = isSimpleMode ? kukuInput.length > 0 : filledCount > 0

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">けいさん れんしゅう</h1>
        <div className="score-area">
          <span className="score-badge">
            🌟 {correctCount} / {totalQ} もん
          </span>
          {streak >= 2 && (
            <span className="streak-badge" key={streak}>
              {streak >= 7 ? '🌟' : streak >= 5 ? '⚡' : '🔥'} {streak} れんぞく！
            </span>
          )}
        </div>
        <div className="progress-area">
          {totalQ <= 20 &&
            Array.from({ length: totalQ }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static list, index as key is safe
              <div key={i} className={`progress-dot${i < correctCount ? ' filled' : ''}`} />
            ))}
        </div>
      </header>

      <main className="main">
        <div className={cardClass}>
          <div className={feedbackClass}>
            {phase === 'correct'
              ? 'せいかい！🎉'
              : phase === 'wrong'
                ? `こたえは ${problem.answer}！🤔`
                : phase === 'hint'
                  ? 'こうやって といてみよう！🔍'
                  : ''}
          </div>
          {isSimpleMode ? (
            <SimpleProblem problem={problem} kukuInput={kukuInput} phase={phase} />
          ) : (
            <HissanProblem problem={problem} digits={digits} filledCount={filledCount} phase={phase} />
          )}
        </div>

        {phase === 'hint' ? (
          <button type="button" className="hint-done-btn" onClick={handleHintDone}>
            わかった！　もう一度やってみる →
          </button>
        ) : (
          <Numpad
            phase={phase}
            canDelete={canDelete}
            canSubmit={canSubmit}
            onDigit={handleDigit}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
          />
        )}

        <button type="button" className="back-btn" onClick={onBack}>
          ← もどる
        </button>
      </main>
    </div>
  )
}
