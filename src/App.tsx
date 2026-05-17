import { useState } from 'react'
import './App.css'
import { PlayingScreen } from './components/PlayingScreen'
import type { AppPhase, KukuMode, Level } from './types'
import { LEVELS, shuffle, TOTAL_QUESTIONS } from './utils'

type PlayingConfig = { mode: 'hissan'; level: Level } | { mode: 'kuku'; dan: number; sequence: number[] }

function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('select')
  const [kukuMode, setKukuMode] = useState<KukuMode>('order')
  const [playingConfig, setPlayingConfig] = useState<PlayingConfig>({ mode: 'hissan', level: LEVELS[0] })

  const startLevel = (l: Level) => {
    setPlayingConfig({ mode: 'hissan', level: l })
    setAppPhase('playing')
  }

  const startKuku = (dan: number, mode: KukuMode) => {
    const seq = mode === 'order' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
    setPlayingConfig({ mode: 'kuku', dan, sequence: seq })
    setAppPhase('playing')
  }

  const backToSelect = () => setAppPhase('select')

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
  if (playingConfig.mode === 'kuku') {
    return (
      <PlayingScreen
        mode="kuku"
        dan={playingConfig.dan}
        sequence={playingConfig.sequence}
        onClear={() => setAppPhase('clear')}
        onBack={backToSelect}
      />
    )
  }
  return (
    <PlayingScreen
      mode="hissan"
      level={playingConfig.level}
      onClear={() => setAppPhase('clear')}
      onBack={backToSelect}
    />
  )
}

export default App
