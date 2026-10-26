import { useEffect, useState } from 'react';
import { goalPresetsApi } from '../api/endpoints';
import type { DailyGoalDto, GoalPresetDto } from '../types/api';

interface GoalEditorProps {
  date: string;
  userId: number;
  initialGoal: DailyGoalDto;
  onClose: () => void;
  onSubmit: (proteinG: number, carbsG: number, fatG: number, veggiesGoalG: number) => Promise<void>;
}

function computeCalories(proteinG: number, carbsG: number, fatG: number): number {
  return Math.round((proteinG * 4 + carbsG * 4 + fatG * 9) * 10) / 10;
}

export function GoalEditor({ date, userId, initialGoal, onClose, onSubmit }: GoalEditorProps) {
  const [proteinG, setProteinG] = useState(String(initialGoal.goal.proteinG));
  const [carbsG, setCarbsG] = useState(String(initialGoal.goal.carbsG));
  const [fatG, setFatG] = useState(String(initialGoal.goal.fatG));
  const [veggiesGoalG, setVeggiesGoalG] = useState(String(initialGoal.veggiesGoalG));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presets, setPresets] = useState<GoalPresetDto[]>([]);
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    goalPresetsApi.list(userId).then(setPresets).catch(() => setPresets([]));
  }, [userId]);

  const previewCalories = computeCalories(Number(proteinG) || 0, Number(carbsG) || 0, Number(fatG) || 0);

  async function applyPreset(preset: GoalPresetDto) {
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(preset.goal.proteinG, preset.goal.carbsG, preset.goal.fatG, preset.veggiesGoalG);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply preset');
      setSubmitting(false);
    }
  }

  async function savePreset() {
    const name = presetName.trim();
    if (!name) {
      setError('Enter a name for the preset');
      return;
    }
    setError(null);
    try {
      const created = await goalPresetsApi.create(userId, {
        name,
        proteinG: Number(proteinG) || 0,
        carbsG: Number(carbsG) || 0,
        fatG: Number(fatG) || 0,
        veggiesGoalG: Number(veggiesGoalG) || 0,
      });
      setPresets((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setPresetName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preset');
    }
  }

  async function deletePreset(preset: GoalPresetDto) {
    setError(null);
    try {
      await goalPresetsApi.remove(userId, preset.id);
      setPresets((prev) => prev.filter((p) => p.id !== preset.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete preset');
    }
  }

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

        {presets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Apply a saved day type</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {presets.map((p) => (
                <span key={p.id} style={{ display: 'inline-flex', gap: 2 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={submitting}
                    title={`P ${p.goal.proteinG} / C ${p.goal.carbsG} / F ${p.goal.fatG} · ${p.goal.calories} kcal`}
                    onClick={() => applyPreset(p)}
                  >
                    {p.name}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    aria-label={`Delete ${p.name}`}
                    onClick={() => deletePreset(p)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
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

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Save these values as… (e.g. High day)"
              maxLength={64}
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-secondary" onClick={savePreset}>
              Save as preset
            </button>
          </div>

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
