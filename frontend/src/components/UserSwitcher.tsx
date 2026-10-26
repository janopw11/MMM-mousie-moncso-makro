import { useState } from 'react';
import { useUsers } from '../context/UserContext';

export function UserSwitcher() {
  const { users, activeUser, selectUser, addUser } = useUsers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await addUser(username.trim());
      setUsername('');
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="user-switcher">
      <select
        value={activeUser?.id ?? ''}
        onChange={(e) => selectUser(Number(e.target.value))}
        aria-label="Active user"
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="btn btn-secondary btn-icon"
        onClick={() => setShowAddForm((v) => !v)}
        aria-label="Add user"
        title="Add user"
      >
        +
      </button>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" style={{ width: 'min(360px, 100%)' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Add new user</h3>
              <button type="button" className="btn btn-secondary btn-icon" onClick={() => setShowAddForm(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleAdd} className="form-row">
              <label htmlFor="new-username">Username</label>
              <input
                id="new-username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Moncso"
                maxLength={64}
              />
              {error && <span className="error-banner">{error}</span>}
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: 8 }}>
                {submitting ? 'Adding…' : 'Add user'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
