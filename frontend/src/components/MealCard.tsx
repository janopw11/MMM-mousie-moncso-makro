import { MEAL_TYPE_LABELS } from '../utils/constants';
import type { MealDto } from '../types/api';

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function MealCard({
  meal,
  onEdit,
  onDelete,
}: {
  meal: MealDto;
  onEdit: (meal: MealDto) => void;
  onDelete: (mealId: number) => void;
}) {
  return (
    <div className="card meal-card">
      <div className="meal-card-head">
        <div>
          <span className="meal-type-badge">{MEAL_TYPE_LABELS[meal.type]}</span>
          <h3 style={{ marginTop: 6 }}>{meal.name}</h3>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={() => onEdit(meal)}
            aria-label={`Edit ${meal.name}`}
            title="Edit meal"
          >
            ✎
          </button>
          <button
            type="button"
            className="btn btn-danger btn-icon"
            onClick={() => onDelete(meal.id)}
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

      <div className="meal-footer">
        <span>{round(meal.macroTotals.calories)} kcal</span>
        <span>
          P {round(meal.macroTotals.proteinG)}g · C {round(meal.macroTotals.carbsG)}g · F{' '}
          {round(meal.macroTotals.fatG)}g
          {meal.veggiesG > 0 && ` · 🥦 ${round(meal.veggiesG)}g`}
        </span>
      </div>
    </div>
  );
}
