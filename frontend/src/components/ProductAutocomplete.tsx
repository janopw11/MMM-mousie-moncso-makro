import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { productsApi } from '../api/endpoints';
import { useAnchoredRect } from '../hooks/useAnchoredRect';
import type { ProductDto } from '../types/api';

interface ProductAutocompleteProps {
  value: string;
  placeholder?: string;
  onNameChange: (name: string) => void;
  onSelectProduct: (product: ProductDto) => void;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function ProductAutocomplete({ value, placeholder, onNameChange, onSelectProduct }: ProductAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProtein, setNewProtein] = useState('');
  const [newCarbs, setNewCarbs] = useState('');
  const [newFat, setNewFat] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rect = useAnchoredRect(inputRef, open);

  useEffect(() => {
    if (!open || showAddForm) return;
    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await productsApi.search(value.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [value, open, showAddForm]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
      setShowAddForm(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleSelect(product: ProductDto) {
    onSelectProduct(product);
    setOpen(false);
    setShowAddForm(false);
  }

  async function handleCreateProduct() {
    const name = value.trim();
    if (!name) {
      setAddError('Enter a product name first');
      return;
    }
    setAddError(null);
    setSaving(true);
    try {
      const created = await productsApi.create({
        name,
        proteinG: Number(newProtein) || 0,
        carbsG: Number(newCarbs) || 0,
        fatG: Number(newFat) || 0,
      });
      handleSelect(created);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={wrapperRef}>
      <input
        ref={inputRef}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onNameChange(e.target.value);
          setOpen(true);
          setShowAddForm(false);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />

      {open &&
        rect &&
        createPortal(
          <div
            ref={panelRef}
            className={showAddForm ? 'card autocomplete-create-panel' : 'card'}
            style={
              showAddForm
                ? {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(380px, calc(100vw - 32px))',
                    zIndex: 200,
                    padding: 12,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    boxShadow: 'var(--shadow-md)',
                  }
                : {
                    position: 'fixed',
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    maxWidth: 'calc(100vw - 16px)',
                    zIndex: 200,
                    padding: 6,
                    maxHeight: rect.maxHeight,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                  }
            }
          >
            {!showAddForm && (
              <>
                {loading && <div style={{ padding: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Searching…</div>}
                {!loading && results.length === 0 && (
                  <div style={{ padding: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No products found</div>
                )}
                {!loading &&
                  results.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => handleSelect(p)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
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
                      <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{p.name}</span>
                      <span style={{ color: 'var(--text-muted)', flex: '0 0 auto', marginLeft: 8 }}>
                        {round(p.calories)} kcal/100g
                      </span>
                    </button>
                  ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: 6, fontSize: '0.82rem', whiteSpace: 'normal' }}
                  onClick={() => setShowAddForm(true)}
                >
                  + Add "{value.trim() || '…'}" as new product
                </button>
              </>
            )}

            {showAddForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 4 }}>
                <strong style={{ fontSize: '0.85rem', overflowWrap: 'anywhere' }}>
                  New product: {value.trim()}
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Macros per 100g</span>
                <div className="form-grid">
                  <div className="form-row">
                    <label>Protein (g)</label>
                    <input type="number" min="0" step="0.1" value={newProtein} onChange={(e) => setNewProtein(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label>Carbs (g)</label>
                    <input type="number" min="0" step="0.1" value={newCarbs} onChange={(e) => setNewCarbs(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <label>Fat (g)</label>
                    <input type="number" min="0" step="0.1" value={newFat} onChange={(e) => setNewFat(e.target.value)} />
                  </div>
                </div>
                {addError && <span className="error-banner">{addError}</span>}
                <div className="autocomplete-create-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" disabled={saving} onClick={handleCreateProduct}>
                    {saving ? 'Saving…' : 'Save product'}
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
