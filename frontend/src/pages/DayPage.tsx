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
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={() => goToDay(-1)}>
          ← Prev day
        </button>
        <h2>{formatDayOfMonth(new Date(dateKey))}</h2>
        <button className="btn btn-secondary" onClick={() => goToDay(1)}>
          Next day →
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {actionError && <div className="error-banner">{actionError}</div>}
      {loading && <div className="spinner-wrap">Loading day…</div>}

      {summary && (
        <>
          <MacroSummary summary={summary} />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
