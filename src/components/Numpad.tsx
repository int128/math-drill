import type { Phase } from '../types'
import { DIGITS } from '../utils'

interface NumpadProps {
  phase: Phase
  canDelete: boolean
  canSubmit: boolean
  onDigit: (d: string) => void
  onDelete: () => void
  onSubmit: () => void
}

export function Numpad({ phase, canDelete, canSubmit, onDigit, onDelete, onSubmit }: NumpadProps) {
  return (
    <div className="numpad">
      {DIGITS.map((d) => (
        <button
          key={d}
          type="button"
          className="digit-btn"
          onClick={() => onDigit(d)}
          disabled={phase !== 'question' && phase !== 'hint'}
        >
          {d}
        </button>
      ))}
      <button
        type="button"
        className="delete-btn"
        onClick={onDelete}
        disabled={(phase !== 'question' && phase !== 'hint') || !canDelete}
      >
        けす
      </button>
      <button
        type="button"
        className="digit-btn"
        onClick={() => onDigit('0')}
        disabled={phase !== 'question' && phase !== 'hint'}
      >
        0
      </button>
      <button
        type="button"
        className="submit-btn"
        onClick={onSubmit}
        disabled={(phase !== 'question' && phase !== 'hint') || !canSubmit}
      >
        こたえる
      </button>
    </div>
  )
}
