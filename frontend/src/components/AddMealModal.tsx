import { useState } from 'react';
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '../utils/constants';
import { ProductAutocomplete } from './ProductAutocomplete';
import { SavedMealAutocomplete } from './SavedMealAutocomplete';
import type { CreateMealRequest, MealDto, MealItemRequest, MealItemType, MealType, ProductDto, SavedMealDto } from '../types/api';

interface DraftItem {
  key: string;
  itemType: MealItemType;
  name: string;
  grams: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
  proteinPer100?: number;
  carbsPer100?: number;
  fatPer100?: number;
}

function emptyItem(itemType: MealItemType): DraftItem {
  return {
    key: `${Date.now()}-${Math.random()}`,
    itemType,
    name: '',
    grams: '',
    proteinG: '',
    carbsG: '',
    fatG: '',
  };
}

function draftItemsFromMeal(meal: Pick<MealDto, 'items'>): DraftItem[] {
  return meal.items.map((item) => ({
    key: `${item.id}-${Math.random()}`,
    itemType: item.itemType,
    name: item.name,
    grams: String(item.grams),
    proteinG: String(item.proteinG),
    carbsG: String(item.carbsG),
    fatG: String(item.fatG),
  }));
}

interface AddMealModalProps {
  date: string;
  initialMeal?: Pick<MealDto, 'name' | 'type' | 'items'>;
  savedMode?: boolean;
  onClose: () => void;
  onSubmit: (request: CreateMealRequest) => Promise<void>;
}

export function AddMealModal({ date, initialMeal, savedMode, onClose, onSubmit }: AddMealModalProps) {
  const isEditing = Boolean(initialMeal);
  const [name, setName] = useState(initialMeal?.name ?? '');
  const [type, setType] = useState<MealType>(initialMeal?.type ?? 'BREAKFAST');
  const [items, setItems] = useState<DraftItem[]>(
    initialMeal ? draftItemsFromMeal(initialMeal) : [emptyItem('INGREDIENT')],
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateItem(key: string, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }

  function addIngredient() {
    setItems((prev) => [...prev, emptyItem('INGREDIENT')]);
  }

  function addVeggie() {
    setItems((prev) => [...prev, emptyItem('VEGGIE')]);
  }

  function selectSavedMeal(meal: SavedMealDto) {
    setName(meal.name);
    setType(meal.type);
    setItems(draftItemsFromMeal(meal));
  }

  function selectProductForItem(key: string, product: ProductDto) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.key !== key) return it;
        const grams = Number(it.grams) > 0 ? Number(it.grams) : 100;
        const factor = grams / 100;
        return {
          ...it,
          name: product.name,
          grams: it.grams || String(grams),
          proteinG: String(Math.round(product.proteinG * factor * 10) / 10),
          carbsG: String(Math.round(product.carbsG * factor * 10) / 10),
          fatG: String(Math.round(product.fatG * factor * 10) / 10),
          proteinPer100: product.proteinG,
          carbsPer100: product.carbsG,
          fatPer100: product.fatG,
        };
      }),
    );
  }

  function updateItemName(key: string, value: string) {
    // Typing a new name detaches the row from the previously selected product,
    // so grams changes stop rescaling from stale per-100g data.
    updateItem(key, { name: value, proteinPer100: undefined, carbsPer100: undefined, fatPer100: undefined });
  }

  function updateGrams(key: string, grams: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.key !== key) return it;
        if (it.proteinPer100 === undefined) {
          return { ...it, grams };
        }
        const factor = (Number(grams) || 0) / 100;
        return {
          ...it,
          grams,
          proteinG: String(Math.round(it.proteinPer100 * factor * 10) / 10),
          carbsG: String(Math.round((it.carbsPer100 ?? 0) * factor * 10) / 10),
          fatG: String(Math.round((it.fatPer100 ?? 0) * factor * 10) / 10),
        };
      }),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Meal name is required');
      return;
    }
    const validItems = items.filter((it) => it.name.trim() && Number(it.grams) > 0);
    if (validItems.length === 0) {
      setError('Add at least one ingredient or vegetable with a name and grams');
      return;
    }

    const payloadItems: MealItemRequest[] = validItems.map((it) => ({
      itemType: it.itemType,
      name: it.name.trim(),
      grams: Number(it.grams),
      proteinG: it.itemType === 'INGREDIENT' ? Number(it.proteinG || 0) : undefined,
      carbsG: it.itemType === 'INGREDIENT' ? Number(it.carbsG || 0) : undefined,
      fatG: it.itemType === 'INGREDIENT' ? Number(it.fatG || 0) : undefined,
    }));

    setSubmitting(true);
    try {
      await onSubmit({ date, name: name.trim(), type, items: payloadItems });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save meal');
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-scrollable" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isEditing ? 'Edit meal' : 'Add meal'}</h2>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-scroll-area">
          <div className="form-row">
            <label htmlFor="meal-name">Meal name</label>
            {savedMode ? (
              <input id="meal-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            ) : (
              <SavedMealAutocomplete
                value={name}
                onNameChange={setName}
                onSelectMeal={selectSavedMeal}
                placeholder="e.g. Oatmeal with banana"
                autoFocus
              />
            )}
          </div>

          <div className="form-row">
            <label>Meal type</label>
            <div className="chip-group">
              {MEAL_TYPE_ORDER.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`chip${type === t ? ' active' : ''}`}
                  onClick={() => setType(t)}
                >
                  {MEAL_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>Ingredients &amp; vegetables</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item) => (
                <div
                  key={item.key}
                  className={item.itemType === 'VEGGIE' ? 'ingredient-row veggie-row' : 'ingredient-row'}
                >
                  <div className="form-row">
                    <label>{item.itemType === 'VEGGIE' ? 'Vegetable' : 'Ingredient'}</label>
                    {item.itemType === 'INGREDIENT' ? (
                      <ProductAutocomplete
                        value={item.name}
                        placeholder="e.g. Rolled oats"
                        onNameChange={(value) => updateItemName(item.key, value)}
                        onSelectProduct={(product) => selectProductForItem(item.key, product)}
                      />
                    ) : (
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(item.key, { name: e.target.value })}
                        placeholder="e.g. Carrot"
                      />
                    )}
                  </div>
                  <div className="form-row">
                    <label>Grams</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={item.grams}
                      onChange={(e) => updateGrams(item.key, e.target.value)}
                      placeholder="85"
                    />
                  </div>
                  {item.itemType === 'INGREDIENT' && (
                    <>
                      <div className="form-row">
                        <label>Protein (g)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.proteinG}
                          onChange={(e) => updateItem(item.key, { proteinG: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="form-row">
                        <label>Carbs (g)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.carbsG}
                          onChange={(e) => updateItem(item.key, { carbsG: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="form-row">
                        <label>Fat (g)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.fatG}
                          onChange={(e) => updateItem(item.key, { fatG: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    className="btn btn-danger btn-icon"
                    onClick={() => removeItem(item.key)}
                    disabled={items.length === 1}
                    aria-label="Remove row"
                    title="Remove row"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={addIngredient}>
                + Add ingredient
              </button>
              <button type="button" className="btn btn-secondary" onClick={addVeggie}>
                🥦 Add vegetable
              </button>
            </div>
          </div>
          </div>

          <div className="modal-footer">
            {error && <span className="error-banner">{error}</span>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Save meal'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
