import { useNavigate } from 'react-router'
import type { Level } from '../types'
import { LEVELS } from '../types'
import { generateProblem } from '../utils'
import '../App.css'

export function SelectPage() {
  const navigate = useNavigate()

  const startLevel = (level: Level) => {
    const problem = generateProblem(level)
    navigate('/play', { state: { level, problem } })
  }

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
