import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { API_BASE } from '../api';
import styles from './ReservationsPage.module.css';

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Reservations page: for users shows their trips; for hosts shows bookings on their properties.
 */
export function ReservationsPage() {
  const { token, user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isHost = user?.role === 'host';
  const endpoint = isHost ? `${API_BASE}/api/reservations/host` : `${API_BASE}/api/reservations/user`;

  useEffect(() => {
    setError('');
    setLoading(true);
    fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load reservations');
        return res.json();
      })
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Something went wrong'))
      .finally(() => setLoading(false));
  }, [endpoint, token]);

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.title}>
          {isHost ? 'Reservations on your listings' : 'My reservations'}
        </h1>
        {loading && <div className={styles.loading}>Loading…</div>}
        {error && <div className={styles.error}>{error}</div>}
        {!loading && !error && list.length === 0 && (
          <p className={styles.empty}>
            {isHost
              ? 'No reservations on your listings yet.'
              : 'You don’t have any reservations. Search for a place to stay!'}
            {!isHost && (
              <>
                {' '}
                <Link to="/">Browse stays</Link>
              </>
            )}
          </p>
        )}
        {!loading && !error && list.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Place</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Total</th>
                  {isHost && <th>Guest</th>}
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <Link to={`/locations/${r.accommodation?._id || r.accommodation}`} className={styles.link}>
                        {r.accommodation?.title || r.accommodation?.location || '—'}
                      </Link>
                    </td>
                    <td>{formatDate(r.startDate)}</td>
                    <td>{formatDate(r.endDate)}</td>
                    <td>{r.guests ?? '—'}</td>
                    <td>${r.totalPrice != null ? Number(r.totalPrice).toFixed(2) : '—'}</td>
                    {isHost && <td>{r.user?.username || '—'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
