import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addDays } from 'date-fns';
import { useUsers } from '../context/UserContext';
import { useDaySummary } from '../hooks/useDaySummary';
import { MacroSummary } from '../components/MacroSummary';
import { MealCard } from '../components/MealCard';
import { AddMealModal } from '../components/AddMealModal';
import { GoalEditor } from '../components/GoalEditor';
import { mealsApi, goalsApi } from '../api/endpoints';
import { formatDayOfMonth, toDateKey } from '../utils/date';
import type { MealDto } from '../types/api';

export function DayPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { activeUser } = useUsers();
  const dateKey = date ?? toDateKey(new Date());
  const { summary, loading, error, reload } = useDaySummary(activeUser?.id ?? null, dateKey);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealDto | null>(null);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!activeUser) {
    return <div className="empty-state">Add a user to get started.</div>;
  }

  function goToDay(delta: number) {
    const next = addDays(new Date(dateKey), delta);
    navigate(`/day/${toDateKey(next)}`);
  }

  async function handleDeleteMeal(mealId: number) {
    if (!activeUser) return;
    if (!confirm('Delete this meal?')) return;
    setActionError(null);
    try {
      await mealsApi.remove(activeUser.id, mealId);
      await reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to delete meal');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card week-navigation">
        <button
          className="btn btn-secondary week-navigation-button"
          aria-label="Previous day"
          title="Previous day"
          onClick={() => goToDay(-1)}
        >
          <span aria-hidden="true">←</span>
          <span className="week-navigation-label">Prev day</span>
        </button>
        <h2 className="week-navigation-range">{formatDayOfMonth(new Date(dateKey))}</h2>
        <button
          className="btn btn-secondary week-navigation-button"
          aria-label="Next day"
          title="Next day"
          onClick={() => goToDay(1)}
        >
          <span className="week-navigation-label">Next day</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {actionError && <div className="error-banner">{actionError}</div>}
      {loading && <div className="spinner-wrap">Loading day…</div>}

      {summary && (
        <>
          <MacroSummary summary={summary} />

          <div className="day-actions">
            <button className="btn btn-primary" onClick={() => setShowAddMeal(true)}>
              + Add meal
            </button>
            <button className="btn btn-secondary" onClick={() => setShowGoalEditor(true)}>
              Edit daily goal
            </button>
          </div>

          <div className="meal-list">
            {summary.meals.length === 0 && <div className="empty-state card">No meals logged yet today.</div>}
            {summary.meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onEdit={setEditingMeal} onDelete={handleDeleteMeal} />
            ))}
          </div>
        </>
      )}

      {showAddMeal && (
        <AddMealModal
          date={dateKey}
          onClose={() => setShowAddMeal(false)}
          onSubmit={async (request) => {
            await mealsApi.create(activeUser.id, request);
            setShowAddMeal(false);
            await reload();
          }}
        />
      )}

      {editingMeal && (
        <AddMealModal
          date={dateKey}
          initialMeal={editingMeal}
          onClose={() => setEditingMeal(null)}
          onSubmit={async (request) => {
            await mealsApi.update(activeUser.id, editingMeal.id, request);
            setEditingMeal(null);
            await reload();
          }}
        />
      )}

      {showGoalEditor && summary && (
        <GoalEditor
          date={dateKey}
          userId={activeUser.id}
          initialGoal={{ date: dateKey, goal: summary.goal, veggiesGoalG: summary.veggiesGoalG }}
          onClose={() => setShowGoalEditor(false)}
          onSubmit={async (proteinG, carbsG, fatG, veggiesGoalG) => {
            await goalsApi.upsert(activeUser.id, dateKey, { proteinG, carbsG, fatG, veggiesGoalG });
            setShowGoalEditor(false);
            await reload();
          }}
        />
      )}
    </div>
  );
}
