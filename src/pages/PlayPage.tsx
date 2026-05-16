import { useCallback, useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import type { Level, Phase, Problem } from '../types'
import { TOTAL_QUESTIONS } from '../types'
import { generateProblem } from '../utils'
import '../App.css'

interface PlayState {
  level: Level
  problem: Problem
}

const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'] as const

interface PlayInnerProps {
  initialLevel: Level
  initialProblem: Problem
}

function PlayInner({ initialLevel, initialProblem }: PlayInnerProps) {
  const navigate = useNavigate()
  const [level] = useState<Level>(initialLevel)
  const [problem, setProblem] = useState<Problem>(initialProblem)
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('question')
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)

  // Auto-transition after feedback
  useEffect(() => {
    if (phase === 'correct') {
      const t = setTimeout(() => {
        if (correctCount >= TOTAL_QUESTIONS) {
          navigate('/clear', { state: { score: correctCount, total: TOTAL_QUESTIONS } })
        } else {
          setProblem(generateProblem(level))
          setInput('')
          setPhase('question')
        }
      }, 1500)
      return () => clearTimeout(t)
    }
    if (phase === 'wrong') {
      const t = setTimeout(() => {
        setInput('')
        setPhase('question')
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [phase, level, correctCount, navigate])

  const handleDigit = useCallback(
    (d: string) => {
      if (phase !== 'question') return
      setInput((prev) => (prev.length >= 3 ? prev : prev + d))
    },
    [phase],
  )

  const handleDelete = useCallback(() => {
    if (phase !== 'question') return
    setInput((prev) => prev.slice(0, -1))
  }, [phase])

  const handleSubmit = useCallback(() => {
    if (phase !== 'question' || input === '') return
    if (parseInt(input, 10) === problem.answer) {
      setCorrectCount((c) => c + 1)
      setStreak((s) => s + 1)
      setPhase('correct')
    } else {
      setStreak(0)
      setPhase('wrong')
    }
  }, [phase, input, problem.answer])

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
  const slotClass = ['answer-slot', phase !== 'question' ? phase : ''].filter(Boolean).join(' ')

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">けいさん れんしゅう</h1>
        <div className="score-area">
          <span className="score-badge">
            🌟 {correctCount} / {TOTAL_QUESTIONS} もん
          </span>
          {streak >= 3 && (
            <span className="streak-badge" key={streak}>
              🔥 {streak} れんぞく！
            </span>
          )}
        </div>
        <div className="progress-area">
          {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => (
            // biome-ignore lint: fixed-length static list, index as key is safe
            <div key={i} className={`progress-dot${i < correctCount ? ' filled' : ''}`} />
          ))}
        </div>
      </header>

      <main className="main">
        <div className={cardClass}>
          <div className={feedbackClass}>{phase === 'correct' ? 'せいかい！🎉' : 'ちがうよ！もういちど 🤔'}</div>
          <div className="problem-display">
            <span className="num">{problem.num1}</span>
            <span className="op">{problem.operator === '+' ? '＋' : '－'}</span>
            <span className="num">{problem.num2}</span>
            <span className="eq">＝</span>
            <span className={slotClass}>{input === '' ? '□' : input}</span>
          </div>
        </div>

        <div className="numpad">
          {DIGITS.map((d) => (
            <button
              key={d}
              type="button"
              className="digit-btn"
              onClick={() => handleDigit(d)}
              disabled={phase !== 'question'}
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            className="delete-btn"
            onClick={handleDelete}
            disabled={phase !== 'question' || input === ''}
          >
            けす
          </button>
          <button type="button" className="digit-btn" onClick={() => handleDigit('0')} disabled={phase !== 'question'}>
            0
          </button>
          <button
            type="button"
            className="submit-btn"
            onClick={handleSubmit}
            disabled={phase !== 'question' || input === ''}
          >
            こたえる
          </button>
        </div>

        <button type="button" className="back-btn" onClick={() => navigate('/')}>
          ← もどる
        </button>
      </main>
    </div>
  )
}

export function PlayPage() {
  const location = useLocation()
  const state = location.state as PlayState | null

  if (!state?.level || !state?.problem) {
    return <Navigate to="/" replace />
  }

  return <PlayInner initialLevel={state.level} initialProblem={state.problem} />
}
