import { ProgressBar } from './ProgressBar';
import { MACRO_COLORS } from '../utils/constants';
import type { DaySummaryDto } from '../types/api';

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function MacroSummary({ summary }: { summary: DaySummaryDto }) {
  const { goal, consumed, remaining, veggiesGoalG, veggiesConsumedG, veggiesRemainingG } = summary;

  const caloriesOver = remaining.calories < 0;

  return (
    <div className="card">
      <div className="card-title">
        <h2>Daily totals</h2>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Calories consumed</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            {round(consumed.calories)}
            <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {' '}
              / {round(goal.calories)} kcal
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: caloriesOver ? 'var(--danger)' : 'var(--success)' }}>
            {caloriesOver
              ? `${round(Math.abs(remaining.calories))} kcal over goal`
              : `${round(remaining.calories)} kcal remaining`}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Veggies</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800 }}>
            {round(veggiesConsumedG)}
            <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {' '}
              / {veggiesGoalG} g
            </span>
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: veggiesRemainingG < 0 ? 'var(--success)' : 'var(--text-secondary)',
            }}
          >
            {veggiesRemainingG < 0
              ? `Goal exceeded by ${round(Math.abs(veggiesRemainingG))} g 🎉`
              : `${round(veggiesRemainingG)} g to go`}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="macro-stat">
          <div className="macro-stat-head">
            <span>
              <span className="macro-dot" style={{ background: MACRO_COLORS.protein }} />
              Protein
            </span>
            <strong>
              {round(consumed.proteinG)}g / {round(goal.proteinG)}g
            </strong>
          </div>
          <ProgressBar value={consumed.proteinG} max={goal.proteinG} color={MACRO_COLORS.protein} />
        </div>

        <div className="macro-stat">
          <div className="macro-stat-head">
            <span>
              <span className="macro-dot" style={{ background: MACRO_COLORS.carbs }} />
              Carbs
            </span>
            <strong>
              {round(consumed.carbsG)}g / {round(goal.carbsG)}g
            </strong>
          </div>
          <ProgressBar value={consumed.carbsG} max={goal.carbsG} color={MACRO_COLORS.carbs} />
        </div>

        <div className="macro-stat">
          <div className="macro-stat-head">
            <span>
              <span className="macro-dot" style={{ background: MACRO_COLORS.fat }} />
              Fat
            </span>
            <strong>
              {round(consumed.fatG)}g / {round(goal.fatG)}g
            </strong>
          </div>
          <ProgressBar value={consumed.fatG} max={goal.fatG} color={MACRO_COLORS.fat} />
        </div>

        <div className="macro-stat">
          <div className="macro-stat-head">
            <span>
              <span className="macro-dot" style={{ background: MACRO_COLORS.veggies }} />
              Veggies
            </span>
            <strong>
              {round(veggiesConsumedG)}g / {veggiesGoalG}g
            </strong>
          </div>
          <ProgressBar value={veggiesConsumedG} max={veggiesGoalG} color={MACRO_COLORS.veggies} />
        </div>
      </div>
    </div>
  );
}
