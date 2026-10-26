import { useCallback, useEffect, useState } from 'react';
import { savedMealsApi } from '../api/endpoints';
import { AddMealModal } from '../components/AddMealModal';
import { MEAL_TYPE_LABELS } from '../utils/constants';
import { toDateKey } from '../utils/date';
import type { SavedMealDto } from '../types/api';

const LIST_LIMIT = 500;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function MealsPage() {
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState<SavedMealDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<SavedMealDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMeals(await savedMealsApi.search(query.trim(), LIST_LIMIT));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load meals');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const handle = setTimeout(load, 250);
    return () => clearTimeout(handle);
  }, [load]);

  async function handleDelete(meal: SavedMealDto) {
    if (!confirm(`Delete "${meal.name}" from saved meals? Logged days are not affected.`)) return;
    try {
      await savedMealsApi.remove(meal.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete meal');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved meals…"
          autoComplete="off"
        />
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="spinner-wrap">Loading meals…</div>}
      {!loading && meals.length === 0 && <div className="empty-state card">No saved meals found.</div>}

      <div className="meal-list">
        {meals.map((meal) => (
          <div className="card meal-card" key={meal.id}>
            <div className="meal-card-head">
              <div>
                <span className="meal-type-badge">{MEAL_TYPE_LABELS[meal.type]}</span>
                <h3 style={{ marginTop: 6 }}>{meal.name}</h3>
                <small>
                  {round(meal.macroTotals.calories)} kcal · P {round(meal.macroTotals.proteinG)}g · C{' '}
                  {round(meal.macroTotals.carbsG)}g · F {round(meal.macroTotals.fatG)}g
                  {meal.veggiesG > 0 ? ` · 🥦 ${round(meal.veggiesG)}g` : ''}
                </small>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  onClick={() => setEditing(meal)}
                  aria-label={`Edit ${meal.name}`}
                  title="Edit meal"
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-icon"
                  onClick={() => handleDelete(meal)}
                  aria-label={`Delete ${meal.name}`}
                  title="Delete meal"
                >
                  🗑
                </button>
              </div>
            </div>
            <div className="meal-items">
              {meal.items.map((item) => (
                <div className="meal-item-row" key={item.id}>
                  <span className={item.itemType === 'VEGGIE' ? 'veggie' : undefined}>
                    {item.itemType === 'VEGGIE' ? '🥦 ' : ''}
                    {item.name} — {round(item.grams)}g
                  </span>
                  {item.itemType === 'INGREDIENT' && (
                    <span>
                      P {round(item.proteinG)} / C {round(item.carbsG)} / F {round(item.fatG)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <AddMealModal
          savedMode
          date={toDateKey(new Date())}
          initialMeal={editing}
          onClose={() => setEditing(null)}
          onSubmit={async ({ name, type, items }) => {
            await savedMealsApi.update(editing.id, { name, type, items });
            setEditing(null);
            await load();
          }}
        />
      )}
    </div>
  );
}
