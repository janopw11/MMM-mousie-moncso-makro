import { useState } from 'react';
import type { DailyGoalDto } from '../types/api';

interface GoalEditorProps {
  date: string;
  initialGoal: DailyGoalDto;
  onClose: () => void;
  onSubmit: (proteinG: number, carbsG: number, fatG: number, veggiesGoalG: number) => Promise<void>;
}

function computeCalories(proteinG: number, carbsG: number, fatG: number): number {
  return Math.round((proteinG * 4 + carbsG * 4 + fatG * 9) * 10) / 10;
}

export function GoalEditor({ date, initialGoal, onClose, onSubmit }: GoalEditorProps) {
  const [proteinG, setProteinG] = useState(String(initialGoal.goal.proteinG));
  const [carbsG, setCarbsG] = useState(String(initialGoal.goal.carbsG));
  const [fatG, setFatG] = useState(String(initialGoal.goal.fatG));
  const [veggiesGoalG, setVeggiesGoalG] = useState(String(initialGoal.veggiesGoalG));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewCalories = computeCalories(Number(proteinG) || 0, Number(carbsG) || 0, Number(fatG) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(Number(proteinG) || 0, Number(carbsG) || 0, Number(fatG) || 0, Number(veggiesGoalG) || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ width: 'min(440px, 100%)' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Daily goal · {date}</h2>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="goal-protein">Protein (g)</label>
              <input
                id="goal-protein"
                type="number"
                min="0"
                step="0.1"
                value={proteinG}
                onChange={(e) => setProteinG(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="goal-carbs">Carbs (g)</label>
              <input
                id="goal-carbs"
                type="number"
                min="0"
                step="0.1"
                value={carbsG}
                onChange={(e) => setCarbsG(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="goal-fat">Fat (g)</label>
              <input
                id="goal-fat"
                type="number"
                min="0"
                step="0.1"
                value={fatG}
                onChange={(e) => setFatG(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="goal-veggies">Veggies goal (g)</label>
              <input
                id="goal-veggies"
                type="number"
                min="0"
                step="1"
                value={veggiesGoalG}
                onChange={(e) => setVeggiesGoalG(e.target.value)}
              />
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-surface-alt)', padding: 12 }}>
            Auto-calculated calories goal: <strong>{previewCalories} kcal</strong>
          </div>

          {error && <span className="error-banner">{error}</span>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
