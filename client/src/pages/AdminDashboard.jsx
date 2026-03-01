import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import styles from './AdminDashboard.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Admin dashboard: fetch accommodations, grid with edit/delete, link to create.
 */
export function AdminDashboard() {
  const { token } = useAuth();
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchList = async () => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/accommodations`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setAccommodations(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/accommodations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Delete failed');
      }
      setAccommodations((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Your listings</h1>
        <div className={styles.actions}>
          <Link to="/admin/create">
            <Button label="Create listing" variant="primary" />
          </Link>
        </div>
      </div>
      <div className={styles.grid}>
        {accommodations.length === 0 ? (
          <p className={styles.loading}>No listings yet. Create one to get started.</p>
        ) : (
          accommodations.map((acc) => (
            <div key={acc._id} className={styles.itemCard}>
              {acc.images?.[0] ? (
                <img
                  src={acc.images[0]}
                  alt=""
                  className={styles.thumbnail}
                />
              ) : (
                <div className={styles.thumbnail} style={{ background: 'var(--light-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray)' }}>
                  No image
                </div>
              )}
              <div className={styles.cardTitle}>{acc.title}</div>
              <div className={styles.cardMeta}>{acc.location} · ${acc.price}/night</div>
              <div className={styles.actions} style={{ marginTop: 'var(--spacing-sm)' }}>
                <Link to={`/admin/update/${acc._id}`}>
                  <Button label="Edit" variant="secondary" />
                </Link>
                <Button
                  label="Delete"
                  variant="danger"
                  onClick={() => handleDelete(acc._id)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
