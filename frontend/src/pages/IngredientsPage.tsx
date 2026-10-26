import { useCallback, useEffect, useState } from 'react';
import { productsApi } from '../api/endpoints';
import { ProductFormModal } from '../components/ProductFormModal';
import type { ProductDto } from '../types/api';

const LIST_LIMIT = 500;

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function IngredientsPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await productsApi.search(query.trim(), LIST_LIMIT));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const handle = setTimeout(load, 250);
    return () => clearTimeout(handle);
  }, [load]);

  async function handleDelete(product: ProductDto) {
    if (!confirm(`Delete "${product.name}" from ingredients?`)) return;
    try {
      await productsApi.remove(product.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete ingredient');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ingredients…"
          autoComplete="off"
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>
          + Add ingredient
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <div className="spinner-wrap">Loading ingredients…</div>}
      {!loading && products.length === 0 && <div className="empty-state card">No ingredients found.</div>}

      <div className="meal-list">
        {products.map((product) => (
          <div className="card meal-card" key={product.id}>
            <div className="meal-card-head">
              <div>
                {product.custom && <span className="meal-type-badge">Custom</span>}
                <h3 style={{ marginTop: 6 }}>{product.name}</h3>
                <small>
                  {round(product.calories)} kcal · P {round(product.proteinG)}g · C {round(product.carbsG)}g · F{' '}
                  {round(product.fatG)}g
                  <span> (per 100g)</span>
                </small>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  onClick={() => setEditing(product)}
                  aria-label={`Edit ${product.name}`}
                  title="Edit ingredient"
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-icon"
                  onClick={() => handleDelete(product)}
                  aria-label={`Delete ${product.name}`}
                  title="Delete ingredient"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {adding && (
        <ProductFormModal
          onClose={() => setAdding(false)}
          onSubmit={async (request) => {
            await productsApi.create(request);
            setAdding(false);
            await load();
          }}
        />
      )}

      {editing && (
        <ProductFormModal
          initialProduct={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (request) => {
            await productsApi.update(editing.id, request);
            setEditing(null);
            await load();
          }}
        />
      )}
    </div>
  );
}
