import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { savedMealsApi } from '../api/endpoints';
import type { SavedMealDto } from '../types/api';

interface SavedMealAutocompleteProps {
  value: string;
  placeholder?: string;
  autoFocus?: boolean;
  onNameChange: (name: string) => void;
  onSelectMeal: (meal: SavedMealDto) => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function SavedMealAutocomplete({
  value,
  placeholder,
  autoFocus,
  onNameChange,
  onSelectMeal,
}: SavedMealAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SavedMealDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function recomputeRect() {
    const input = inputRef.current;
    if (!input) return;
    const r = input.getBoundingClientRect();
    setRect({ top: r.bottom + 4, left: r.left, width: r.width });
  }

  useEffect(() => {
    if (!open) return;
    recomputeRect();
    window.addEventListener('resize', recomputeRect);
    window.addEventListener('scroll', recomputeRect, true);
    return () => {
      window.removeEventListener('resize', recomputeRect);
      window.removeEventListener('scroll', recomputeRect, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await savedMealsApi.search(value.trim()));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [value, open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const muted = { padding: 8, fontSize: '0.85rem', color: 'var(--text-muted)' };

  return (
    <div ref={wrapperRef}>
      <input
        id="meal-name"
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        onChange={(e) => {
          onNameChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            className="card"
            style={{
              position: 'fixed',
              top: rect.top,
              left: rect.left,
              width: rect.width,
              minWidth: 280,
              zIndex: 200,
              padding: 6,
              maxHeight: '50vh',
              overflowY: 'auto',
            }}
          >
            {loading && <div style={muted}>Searching…</div>}
            {!loading && results.length === 0 && <div style={muted}>No saved meals found</div>}
            {!loading &&
              results.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    onSelectMeal(m);
                    setOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: '6px 8px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                  }}
                >
                  <span>{m.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                    {round(m.macroTotals.calories)} kcal · P {round(m.macroTotals.proteinG)}g · C{' '}
                    {round(m.macroTotals.carbsG)}g · F {round(m.macroTotals.fatG)}g
                    {m.veggiesG > 0 ? ` · 🥦 ${round(m.veggiesG)}g` : ''}
                  </span>
                </button>
              ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
