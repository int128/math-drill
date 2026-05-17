import { useCallback, useEffect, useState } from 'react'
import './App.css'

type Operator = '+' | '-' | '*'
type Difficulty = 'easy' | 'hard'
type AppPhase = 'select' | 'kuku-select' | 'playing' | 'clear'
type Phase = 'question' | 'correct' | 'wrong'
type KukuMode = 'order' | 'shuffle'

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
  { difficulty: 'hard', operator: '+', label: 'むずかしい たしざん', icon: '🌟' },
  { difficulty: 'easy', operator: '-', label: 'かんたん ひきざん', icon: '⭐' },
  { difficulty: 'hard', operator: '-', label: 'むずかしい ひきざん', icon: '🌟' },
]

const TOTAL_QUESTIONS = 10
const KUKU_TOTAL = 9

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
  if (operator === '-') {
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
  throw new Error(`unsupported operator: ${operator}`)
}

function shuffle(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getNumBoxes(level: Level): number {
  return level.difficulty === 'hard' ? 3 : 2
}

function splitDigits(num: number, N: number): string[] {
  const s = String(num)
  return Array.from({ length: N }, (_, i) => {
    const pos = s.length - (N - i)
    return pos >= 0 ? s[pos] : ''
  })
}

const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'] as const

function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('select')
  const [level, setLevel] = useState<Level>(LEVELS[0])
  const [problem, setProblem] = useState<Problem>(() => generateProblem(LEVELS[0]))
  const [digits, setDigits] = useState<string[]>(() => Array(getNumBoxes(LEVELS[0])).fill(''))
  const [filledCount, setFilledCount] = useState(0)
  const [phase, setPhase] = useState<Phase>('question')
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [isKukuMode, setIsKukuMode] = useState(false)
  const [kukuDan, setKukuDan] = useState(2)
  const [kukuMode, setKukuMode] = useState<KukuMode>('order')
  const [kukuSequence, setKukuSequence] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9])
  const [kukuInput, setKukuInput] = useState('')

  const startLevel = useCallback((l: Level) => {
    setIsKukuMode(false)
    setLevel(l)
    setProblem(generateProblem(l))
    setDigits(Array(getNumBoxes(l)).fill(''))
    setFilledCount(0)
    setPhase('question')
    setCorrectCount(0)
    setStreak(0)
    setAppPhase('playing')
  }, [])

  const startKuku = useCallback((dan: number, mode: KukuMode) => {
    const seq = mode === 'order' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
    setIsKukuMode(true)
    setKukuDan(dan)
    setKukuSequence(seq)
    setProblem({ num1: dan, num2: seq[0], operator: '*', answer: dan * seq[0] })
    setKukuInput('')
    setFilledCount(0)
    setPhase('question')
    setCorrectCount(0)
    setStreak(0)
    setAppPhase('playing')
  }, [])

  const backToSelect = useCallback(() => {
    setIsKukuMode(false)
    setAppPhase('select')
  }, [])

  // Auto-transition after feedback
  useEffect(() => {
    if (appPhase !== 'playing') return
    const totalQ = isKukuMode ? KUKU_TOTAL : TOTAL_QUESTIONS
    if (phase === 'correct') {
      const t = setTimeout(() => {
        if (correctCount >= totalQ) {
          setAppPhase('clear')
        } else {
          if (isKukuMode) {
            setProblem({
              num1: kukuDan,
              num2: kukuSequence[correctCount],
              operator: '*',
              answer: kukuDan * kukuSequence[correctCount],
            })
            setKukuInput('')
          } else {
            setProblem(generateProblem(level))
            setDigits(Array(getNumBoxes(level)).fill(''))
          }
          setFilledCount(0)
          setPhase('question')
        }
      }, 1500)
      return () => clearTimeout(t)
    }
    if (phase === 'wrong') {
      const t = setTimeout(() => {
        if (isKukuMode) {
          setKukuInput('')
        } else {
          setDigits(Array(getNumBoxes(level)).fill(''))
        }
        setFilledCount(0)
        setPhase('question')
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [phase, appPhase, level, correctCount, isKukuMode, kukuDan, kukuSequence])

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
          <button type="button" className="kuku-btn" onClick={() => setAppPhase('kuku-select')}>
            <span className="level-icon">✖️</span>
            <span className="level-label">かけざん 九九</span>
          </button>
        </main>
      </div>
    )
  }

  // ---- Kuku select screen ----
  if (appPhase === 'kuku-select') {
    return (
      <div className="app">
        <header className="header">
          <h1 className="title">けいさん れんしゅう</h1>
        </header>
        <main className="main">
          <p className="kuku-heading">かけざん 九九</p>
          <div className="kuku-mode-row">
            <button
              type="button"
              className={`kuku-mode-btn${kukuMode === 'order' ? ' active' : ''}`}
              onClick={() => setKukuMode('order')}
            >
              じゅんばん
            </button>
            <button
              type="button"
              className={`kuku-mode-btn${kukuMode === 'shuffle' ? ' active' : ''}`}
              onClick={() => setKukuMode('shuffle')}
            >
              シャッフル
            </button>
          </div>
          <p className="kuku-dan-heading">どの だんをえらぼう？</p>
          <div className="kuku-dan-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((dan) => (
              <button key={dan} type="button" className="kuku-dan-btn" onClick={() => startKuku(dan, kukuMode)}>
                {dan}の段
              </button>
            ))}
          </div>
          <button type="button" className="back-btn" onClick={backToSelect}>
            ← もどる
          </button>
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

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">けいさん れんしゅう</h1>
        <div className="score-area">
          <span className="score-badge">
            🌟 {correctCount} / {isKukuMode ? KUKU_TOTAL : TOTAL_QUESTIONS} もん
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
          ) : (
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
          )}
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
            disabled={phase !== 'question' || filledCount === 0}
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
            disabled={phase !== 'question' || filledCount === 0}
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
