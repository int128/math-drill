import { useCallback, useEffect, useState } from 'react'
import './App.css'

type Operator = '+' | '-'
type Phase = 'question' | 'correct' | 'wrong'

interface Problem {
  num1: number
  num2: number
  operator: Operator
  answer: number
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateProblem(): Problem {
  const operator: Operator = Math.random() < 0.5 ? '+' : '-'
  // 50% chance to use a single-digit second operand (easier problems mixed in)
  const useSingleDigit = Math.random() < 0.5

  if (operator === '+') {
    const num1 = randInt(10, 99)
    const num2 = useSingleDigit ? randInt(1, 9) : randInt(10, 99)
    return { num1, num2, operator, answer: num1 + num2 }
  }

  // Subtraction: ensure result >= 1
  const num1 = randInt(20, 99)
  const num2 = useSingleDigit ? randInt(1, Math.min(9, num1 - 1)) : randInt(10, num1 - 1)
  return { num1, num2, operator, answer: num1 - num2 }
}

const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'] as const

function App() {
  const [problem, setProblem] = useState<Problem>(generateProblem)
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('question')
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)

  // Auto-transition after feedback
  useEffect(() => {
    if (phase === 'correct') {
      const t = setTimeout(() => {
        setProblem(generateProblem())
        setInput('')
        setPhase('question')
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
  }, [phase])

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
          <span className="score-badge">🌟 {correctCount} もん せいかい！</span>
          {streak >= 3 && (
            <span className="streak-badge" key={streak}>
              🔥 {streak} れんぞく！
            </span>
          )}
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
      </main>
    </div>
  )
}

export default App
