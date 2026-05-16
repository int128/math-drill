import { useLocation, useNavigate } from 'react-router'
import { TOTAL_QUESTIONS } from '../types'
import '../App.css'

interface ClearState {
  score: number
  total: number
}

export function ClearPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as ClearState | null
  const total = state?.total ?? TOTAL_QUESTIONS

  return (
    <div className="app">
      <main className="main">
        <div className="clear-card">
          <div className="clear-emoji">🎉</div>
          <div className="clear-title">クリア！</div>
          <div className="clear-score">{total} もん ぜんぶ せいかい！</div>
          <button type="button" className="retry-btn" onClick={() => navigate('/')}>
            もどる
          </button>
        </div>
      </main>
    </div>
  )
}
