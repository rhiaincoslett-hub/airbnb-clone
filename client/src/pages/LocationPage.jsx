import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { API_BASE } from '../api';
import styles from './LocationPage.module.css';

/**
 * Location listing page: fetch accommodations, filter by location param, show count and cards.
 */
export function LocationPage() {
  const [searchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noMatchForQuery, setNoMatchForQuery] = useState(null);

  useEffect(() => {
    setError('');
    setLoading(true);
    const url = `${API_BASE}/api/accommodations`;
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`Server error (${res.status}). Is the API running at ${API_BASE}?`);
          });
        }
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        let filtered = list;
        if (locationFilter.trim()) {
          const q = locationFilter.toLowerCase().trim();
          filtered = list.filter(
            (a) =>
              (a.location && a.location.toLowerCase().includes(q)) ||
              (a.title && a.title.toLowerCase().includes(q))
          );
          // If search had no matches but we have listings, show all with a message
          if (filtered.length === 0 && list.length > 0) {
            filtered = list;
            setAccommodations(filtered);
            setNoMatchForQuery(locationFilter.trim());
            return;
          }
        }
        setNoMatchForQuery(null);
        setAccommodations(filtered);
      })
      .catch((err) => setError(err.message || 'Failed to load. Check the server is running on port 5001.'))
      .finally(() => setLoading(false));
  }, [locationFilter]);

  const locationLabel = locationFilter.trim() || 'all locations';
  const count = accommodations.length;

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.heading}>
          {count} {count === 1 ? 'stay' : 'stays'} in {locationLabel}
        </h1>
        {noMatchForQuery && (
          <p className={styles.noMatch}>
            No stays found for &quot;{noMatchForQuery}&quot;. Showing all locations.
          </p>
        )}
        {loading && <div className={styles.loading}>Loading…</div>}
        {error && (
          <div className={styles.error}>
            {error}
            <p className={styles.errorHint}>
              From the project root run: <code>cd server && npm start</code> (server should log “Server running on port 5001”).
            </p>
          </div>
        )}
        {!loading && !error && count === 0 && (
          <div className={styles.empty}>
            <p>No stays to show yet.</p>
            <p className={styles.emptyHint}>
              Add listings from the <Link to="/admin">admin dashboard</Link> or try searching without a location.
            </p>
          </div>
        )}
        {!loading && !error && count > 0 && (
          <div className={styles.grid}>
            {accommodations.map((acc) => (
              <Card
                key={acc._id}
                id={acc._id}
                image={acc.images?.[0]}
                type={acc.type}
                location={acc.location}
                amenities={acc.amenities?.slice(0, 3).join(' · ')}
                price={acc.price}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
