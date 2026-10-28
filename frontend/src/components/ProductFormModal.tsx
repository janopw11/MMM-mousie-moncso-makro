import { useState } from 'react';
import type { CreateProductRequest, ProductDto } from '../types/api';

interface ProductFormModalProps {
  initialProduct?: ProductDto;
  onClose: () => void;
  onSubmit: (request: CreateProductRequest) => Promise<void>;
}

export function ProductFormModal({ initialProduct, onClose, onSubmit }: ProductFormModalProps) {
  const isEditing = Boolean(initialProduct);
  const [name, setName] = useState(initialProduct?.name ?? '');
  const [proteinG, setProteinG] = useState(initialProduct ? String(initialProduct.proteinG) : '');
  const [carbsG, setCarbsG] = useState(initialProduct ? String(initialProduct.carbsG) : '');
  const [fatG, setFatG] = useState(initialProduct ? String(initialProduct.fatG) : '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        proteinG: Number(proteinG || 0),
        carbsG: Number(carbsG || 0),
        fatG: Number(fatG || 0),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isEditing ? 'Edit ingredient' : 'Add ingredient'}</h2>
          <button type="button" className="btn btn-secondary btn-icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <label htmlFor="product-name">Name</label>
            <input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rolled oats"
              autoFocus
            />
          </div>

          <small>Macro values are per 100g of the product.</small>

          <div className="form-row">
            <label htmlFor="product-protein">Protein (g)</label>
            <input
              id="product-protein"
              type="number"
              min="0"
              step="0.1"
              value={proteinG}
              onChange={(e) => setProteinG(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="form-row">
            <label htmlFor="product-carbs">Carbs (g)</label>
            <input
              id="product-carbs"
              type="number"
              min="0"
              step="0.1"
              value={carbsG}
              onChange={(e) => setCarbsG(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="form-row">
            <label htmlFor="product-fat">Fat (g)</label>
            <input
              id="product-fat"
              type="number"
              min="0"
              step="0.1"
              value={fatG}
              onChange={(e) => setFatG(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="modal-footer">
            {error && <span className="error-banner">{error}</span>}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : isEditing ? 'Save changes' : 'Save ingredient'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
