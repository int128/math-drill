import { useCallback, useEffect, useRef, useState } from 'react'
import type { KukuPair, KukuTableHole, Level, Phase, Problem } from '../types'
import { generateProblem, getNumBoxes, TOTAL_QUESTIONS } from '../utils'
import { HissanProblem } from './HissanProblem'
import { KukuTableChallenge } from './KukuTableChallenge'
import { Numpad } from './Numpad'
import { SimpleProblem } from './SimpleProblem'

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext
}

type PlayingScreenProps =
  | { mode: 'hissan'; level: Level; onClear: () => void; onBack: () => void }
  | { mode: 'kuku'; dan: number; pairs: KukuPair[]; onClear: () => void; onBack: () => void }
  | { mode: 'kuku-table'; holes: KukuTableHole[]; onClear: () => void; onBack: () => void }

export function PlayingScreen(props: PlayingScreenProps) {
  const { onClear, onBack } = props
  const isKukuMode = props.mode === 'kuku'
  const isKukuTableMode = props.mode === 'kuku-table'
  const isSimpleHissan = props.mode === 'hissan' && props.level.difficulty === 'easy'
  const isSimpleMode = isKukuMode || isKukuTableMode || isSimpleHissan
  const totalQ =
    props.mode === 'kuku' ? props.pairs.length : props.mode === 'kuku-table' ? props.holes.length : TOTAL_QUESTIONS

  const [problem, setProblem] = useState<Problem>(() => {
    if (props.mode === 'kuku') {
      const { num1, num2 } = props.pairs[0]
      return { num1, num2, operator: '*', answer: num1 * num2 }
    }
    if (props.mode === 'kuku-table') {
      const { num1, num2 } = props.holes[0]
      return { num1, num2, operator: '*', answer: num1 * num2 }
    }
    return generateProblem(props.level)
  })
  const [digits, setDigits] = useState<string[]>(() =>
    props.mode === 'hissan' && props.level.difficulty === 'hard' ? Array(getNumBoxes(props.level)).fill('') : [],
  )
  const [filledCount, setFilledCount] = useState(0)
  const [kukuInput, setKukuInput] = useState('')
  const [tableAnswers, setTableAnswers] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<Phase>('question')
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)

  const playCorrectSound = useCallback(() => {
    const Ctx = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext
    if (!Ctx) return

    const ctx = audioContextRef.current ?? new Ctx()
    audioContextRef.current = ctx
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }

    const now = ctx.currentTime
    const createTone = (startAt: number, freq: number, duration: number, volume: number) => {
      const gain = ctx.createGain()
      gain.connect(ctx.destination)
      gain.gain.setValueAtTime(0.0001, startAt)
      gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startAt)
      osc.connect(gain)
      osc.start(startAt)
      osc.stop(startAt + duration)
    }

    // "ピン" -> "ポーン" の2音チャイム
    createTone(now, 1000, 0.4, 0.54)
    createTone(now + 0.14, 800, 0.5, 0.52)
  }, [])

  useEffect(() => {
    return () => {
      const ctx = audioContextRef.current
      if (ctx) {
        void ctx.close()
      }
    }
  }, [])

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
          } else if (props.mode === 'kuku-table') {
            const { num1, num2 } = props.holes[correctCount]
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
      if (phase !== 'question' && phase !== 'hint') return
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
    if (phase !== 'question' && phase !== 'hint') return
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
    if (phase !== 'question' && phase !== 'hint') return
    if (isSimpleMode) {
      if (kukuInput.length === 0) return
      const num = parseInt(kukuInput, 10)
      if (num === problem.answer) {
        if (props.mode === 'kuku-table') {
          setTableAnswers((prev) => ({ ...prev, [`${problem.num1}-${problem.num2}`]: kukuInput }))
        }
        playCorrectSound()
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
      playCorrectSound()
      setCorrectCount((c) => c + 1)
      setStreak((s) => s + 1)
      setPhase('correct')
    } else {
      setStreak(0)
      setDigits(Array(digits.length).fill(''))
      setFilledCount(0)
      setPhase('hint')
    }
  }, [
    phase,
    isSimpleMode,
    kukuInput,
    filledCount,
    digits,
    problem.answer,
    problem.num1,
    problem.num2,
    playCorrectSound,
    props.mode,
  ])

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
  const canDelete = isSimpleMode ? kukuInput.length > 0 : filledCount > 0
  const canSubmit = isSimpleMode ? kukuInput.length > 0 : filledCount > 0

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">けいさんドリル</h1>
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
          {isKukuTableMode ? (
            <KukuTableChallenge
              holes={props.holes}
              filledAnswers={tableAnswers}
              activeInput={kukuInput}
              currentIndex={correctCount}
              phase={phase}
            />
          ) : isSimpleMode ? (
            <SimpleProblem problem={problem} kukuInput={kukuInput} phase={phase} />
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

        {!isSimpleMode && (
          <button
            type="button"
            className="hint-btn"
            onClick={() => {
              if (phase === 'hint') {
                setPhase('question')
              } else if (phase === 'question') {
                setDigits(Array(digits.length).fill(''))
                setFilledCount(0)
                setPhase('hint')
              }
            }}
          >
            {phase === 'hint' ? '✕ ヒントをとじる' : '🔍 ヒントをみる'}
          </button>
        )}

        <button type="button" className="back-btn" onClick={onBack}>
          ← もどる
        </button>
      </main>
    </div>
  )
}
