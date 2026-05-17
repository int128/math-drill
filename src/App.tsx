import { useCallback, useEffect, useState } from 'react'
import './App.css'

type Operator = '+' | '-'
type Difficulty = 'easy' | 'hard'
type AppPhase = 'select' | 'playing' | 'clear'
type Phase = 'question' | 'correct' | 'wrong'

interface Level {
  difficulty: Difficulty
  operator: Operator
  label: string
  icon: string
}

interface Problem {
  num1: number
  num2: number
  operator: Operator
  answer: number
}

const LEVELS: Level[] = [
  { difficulty: 'easy', operator: '+', label: 'かんたん たしざん', icon: '⭐' },
  { difficulty: 'easy', operator: '-', label: 'かんたん ひきざん', icon: '⭐' },
  { difficulty: 'hard', operator: '+', label: 'むずかしい たしざん', icon: '🌟' },
  { difficulty: 'hard', operator: '-', label: 'むずかしい ひきざん', icon: '🌟' },
]

const TOTAL_QUESTIONS = 10

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateProblem(level: Level): Problem {
  const { difficulty, operator } = level
  if (operator === '+') {
    if (difficulty === 'easy') {
      const num1 = randInt(1, 9)
      const num2 = randInt(1, 9)
      return { num1, num2, operator, answer: num1 + num2 }
    }
    const num1 = randInt(10, 99)
    const num2 = randInt(10, 99)
    return { num1, num2, operator, answer: num1 + num2 }
  }
  // Subtraction: ensure result >= 1
  if (difficulty === 'easy') {
    const num1 = randInt(2, 9)
    const num2 = randInt(1, num1 - 1)
    return { num1, num2, operator, answer: num1 - num2 }
  }
  const num1 = randInt(20, 99)
  const num2 = randInt(10, num1 - 1)
  return { num1, num2, operator, answer: num1 - num2 }
}

const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'] as const

function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('select')
  const [level, setLevel] = useState<Level>(LEVELS[0])
  const [problem, setProblem] = useState<Problem>(() => generateProblem(LEVELS[0]))
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('question')
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)

  const startLevel = useCallback((l: Level) => {
    setLevel(l)
    setProblem(generateProblem(l))
    setInput('')
    setPhase('question')
    setCorrectCount(0)
    setStreak(0)
    setAppPhase('playing')
  }, [])

  const backToSelect = useCallback(() => {
    setAppPhase('select')
  }, [])

  // Auto-transition after feedback
  useEffect(() => {
    if (appPhase !== 'playing') return
    if (phase === 'correct') {
      const t = setTimeout(() => {
        if (correctCount >= TOTAL_QUESTIONS) {
          setAppPhase('clear')
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
  }, [phase, appPhase, level, correctCount])

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
    if (appPhase !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key)
      else if (e.key === 'Backspace') handleDelete()
      else if (e.key === 'Enter') handleSubmit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [appPhase, handleDigit, handleDelete, handleSubmit])

  // ---- Level select screen ----
  if (appPhase === 'select') {
    return (
      <div className="app">
        <header className="header">
          <h1 className="title">けいさん れんしゅう</h1>
        </header>
        <main className="main">
          <p className="level-heading">レベルをえらんでね</p>
          <div className="level-grid">
            {LEVELS.map((l) => (
              <button
                key={`${l.difficulty}-${l.operator}`}
                type="button"
                className={`level-btn ${l.difficulty}`}
                onClick={() => startLevel(l)}
              >
                <span className="level-icon">{l.icon}</span>
                <span className="level-label">{l.label}</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    )
  }

  // ---- Clear screen ----
  if (appPhase === 'clear') {
    return (
      <div className="app">
        <main className="main">
          <div className="clear-card">
            <div className="clear-emoji">🎉</div>
            <div className="clear-title">クリア！</div>
            <div className="clear-score">{TOTAL_QUESTIONS} もん ぜんぶ せいかい！</div>
            <button type="button" className="retry-btn" onClick={backToSelect}>
              もどる
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ---- Playing screen ----
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
          <div className="problem-vertical">
            <div className="vrow">
              <span className="op vop-hidden">＋</span>
              <span className="num">{problem.num1}</span>
            </div>
            <div className="vrow">
              <span className="op">{problem.operator === '+' ? '＋' : '－'}</span>
              <span className="num">{problem.num2}</span>
            </div>
            <div className="vline" />
            <div className="vrow">
              <span className="op vop-hidden">＋</span>
              <span className={slotClass}>{input === '' ? '□' : input}</span>
            </div>
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

        <button type="button" className="back-btn" onClick={backToSelect}>
          ← もどる
        </button>
      </main>
    </div>
  )
}

export default App
