import React, { useState } from 'react'
import './App.css'
import { PlayingScreen } from './components/PlayingScreen'
import type { AppPhase, KukuMode, KukuPair, Level } from './types'
import { generateKukuPairs, LEVELS, TOTAL_QUESTIONS } from './utils'

type PlayingConfig = { mode: 'hissan'; level: Level } | { mode: 'kuku'; dan: number; pairs: KukuPair[] }

function App() {
  const [appPhase, setAppPhase] = useState<AppPhase>('select')
  const [playingConfig, setPlayingConfig] = useState<PlayingConfig>({ mode: 'hissan', level: LEVELS[0] })

  const startLevel = (l: Level) => {
    setPlayingConfig({ mode: 'hissan', level: l })
    setAppPhase('playing')
  }

  const startKuku = (dan: number, mode: KukuMode) => {
    setPlayingConfig({ mode: 'kuku', dan, pairs: generateKukuPairs(dan, mode) })
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
            {LEVELS.filter((l) => l.operator !== '*').map((l) => (
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
          <div className="level-grid">
            {LEVELS.filter((l) => l.operator === '*').map((l) => (
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

  // ---- Kuku select screen ----
  if (appPhase === 'kuku-select') {
    return (
      <div className="app">
        <header className="header">
          <h1 className="title">けいさん れんしゅう</h1>
        </header>
        <main className="main">
          <p className="kuku-heading">かけざん 九九</p>
          <p className="kuku-dan-heading">どの だんをえらぼう？</p>
          <div className="kuku-dan-list">
            <div className="kuku-dan-list-header" />
            <span className="kuku-dan-list-col-label">じゅんばん</span>
            <span className="kuku-dan-list-col-label">シャッフル</span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((dan) => (
              <React.Fragment key={dan}>
                <span className="kuku-dan-label">{dan}の段</span>
                <button type="button" className="kuku-order-btn" onClick={() => startKuku(dan, 'order')}>
                  じゅんばん
                </button>
                <button type="button" className="kuku-shuffle-btn" onClick={() => startKuku(dan, 'shuffle')}>
                  シャッフル
                </button>
              </React.Fragment>
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
        pairs={playingConfig.pairs}
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
