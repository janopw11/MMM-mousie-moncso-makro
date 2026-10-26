import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../context/UserContext';
import { useWeekSummary } from '../hooks/useWeekSummary';
import { GoalEditor } from '../components/GoalEditor';
import { ProgressBar } from '../components/ProgressBar';
import { goalsApi } from '../api/endpoints';
import { formatDayLabel, formatDayOfMonth, getWeekStart, shiftWeek, toDateKey } from '../utils/date';
import type { DaySummaryDto } from '../types/api';

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function WeekPage() {
  const { activeUser } = useUsers();
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(() => toDateKey(getWeekStart(new Date())));
  const { summary, loading, error, reload } = useWeekSummary(activeUser?.id ?? null, weekStart);
  const [editingDay, setEditingDay] = useState<DaySummaryDto | null>(null);

  const todayKey = toDateKey(new Date());

  const weekRangeLabel = useMemo(() => {
    if (!summary) return '';
    return `${formatDayOfMonth(new Date(summary.weekStart))} – ${formatDayOfMonth(new Date(summary.weekEnd))}`;
  }, [summary]);

  if (!activeUser) {
    return <div className="empty-state">Add a user to get started.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={() => setWeekStart((w) => shiftWeek(w, -1))}>
          ← Prev week
        </button>
        <h2>{weekRangeLabel || 'Loading…'}</h2>
        <button className="btn btn-secondary" onClick={() => setWeekStart((w) => shiftWeek(w, 1))}>
          Next week →
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="spinner-wrap">Loading week…</div>}

      {summary && (
        <div className="week-grid">
          {summary.days.map((day) => (
            <div
              key={day.date}
              className={`card day-card${day.date === todayKey ? ' is-today' : ''}`}
              onClick={() => navigate(`/day/${day.date}`)}
            >
              <div className="day-card-head">
                <span className="dow">{formatDayLabel(new Date(day.date))}</span>
                <span className="dom">{formatDayOfMonth(new Date(day.date))}</span>
              </div>

              <div className="day-card-calories">
                {round(day.consumed.calories)}
                <small> / {round(day.goal.calories)} kcal</small>
              </div>
              <ProgressBar value={day.consumed.calories} max={day.goal.calories} color="var(--accent)" />

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                🥦 {round(day.veggiesConsumedG)} / {day.veggiesGoalG}g
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '4px 10px', marginTop: 4 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingDay(day);
                }}
              >
                Set goal
              </button>
            </div>
          ))}
        </div>
      )}

      {editingDay && (
        <GoalEditor
          date={editingDay.date}
          userId={activeUser.id}
          initialGoal={{ date: editingDay.date, goal: editingDay.goal, veggiesGoalG: editingDay.veggiesGoalG }}
          onClose={() => setEditingDay(null)}
          onSubmit={async (proteinG, carbsG, fatG, veggiesGoalG) => {
            await goalsApi.upsert(activeUser.id, editingDay.date, { proteinG, carbsG, fatG, veggiesGoalG });
            setEditingDay(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}
