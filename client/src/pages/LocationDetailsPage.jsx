import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import styles from './LocationDetailsPage.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Compute total price from accommodation and stay params.
 * @param {object} acc - Accommodation
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @param {number} guests - Guest count
 */
function computeTotal(acc, start, end, guests) {
  if (!acc?.price || !start || !end) return 0;
  const nights = Math.max(0, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
  let base = acc.price * nights;
  const weeklyDiscount = (acc.weeklyDiscount || 0) / 100;
  if (weeklyDiscount > 0 && nights >= 7) {
    base *= 1 - weeklyDiscount;
  }
  const cleaningFee = acc.cleaningFee || 0;
  const serviceFee = acc.serviceFee || 0;
  const taxes = acc.occupancyTaxes || 0;
  return base + cleaningFee + serviceFee + taxes;
}

/**
 * Detail page: gallery, details, cost calculator with date/guests and reserve.
 */
export function LocationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [acc, setAcc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [guests, setGuests] = useState(1);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/accommodations/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Listing not found');
        return res.json();
      })
      .then((data) => {
        setAcc(data);
        if (data.guests) setGuests(data.guests);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const nights = startDate && endDate
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (24 * 60 * 60 * 1000))
    : 0;
  const totalPrice = acc ? computeTotal(acc, startDate ? new Date(startDate) : null, endDate ? new Date(endDate) : null, guests) : 0;

  const handleReserve = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!startDate || !endDate) {
      setReserveError('Please select check-in and check-out dates');
      return;
    }
    setReserveError('');
    setReserveLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accommodationId: acc._id,
          startDate,
          endDate,
          guests,
          totalPrice,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Reservation failed');
      navigate('/reservations');
    } catch (err) {
      setReserveError(err.message || 'Could not complete reservation');
    } finally {
      setReserveLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (error || !acc) return <div className={styles.error}>{error || 'Not found'}</div>;

  const images = acc.images && acc.images.length ? acc.images : [];
  const mainImage = images[0];
  const subImages = images.slice(1, 5);

  return (
    <>
      <Header />
      <div className={styles.container}>
        <h1 className={styles.heading}>
          {acc.type || 'Accommodation'} in {acc.location}
        </h1>
        <p className={styles.subheading}>★ 4.8 · 120 reviews</p>

        <div className={styles.gallery}>
          <div className={styles.galleryMain}>
            {mainImage ? (
              <img src={mainImage} alt="" />
            ) : (
              <div className={styles.placeholder}>No image</div>
            )}
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={styles.gallerySub}>
              {subImages[i] ? (
                <img src={subImages[i]} alt="" />
              ) : (
                <div className={styles.placeholder} style={{ height: '100%' }} />
              )}
            </div>
          ))}
        </div>

        <div className={styles.twoCol}>
          <div className={styles.details}>
            <h3>About this place</h3>
            <p>{acc.description || 'No description.'}</p>
            <h3>Where you&apos;ll sleep</h3>
            <p>Bedrooms: {acc.bedrooms ?? '—'}, Bathrooms: {acc.bathrooms ?? '—'}</p>
            <h3>Amenities</h3>
            <p>{acc.amenities?.length ? acc.amenities.join(', ') : 'None listed.'}</p>
            <h3>Host</h3>
            <p>{acc.host?.username ? `Hosted by ${acc.host.username}` : '—'}</p>
            <h3>House rules</h3>
            <p>Check-in after 3:00 PM, check-out before 11:00 AM.</p>
            <h3>Health & safety</h3>
            <p>Follow local guidelines.</p>
            <h3>Cancellation policy</h3>
            <p>Free cancellation before 24 hours of check-in.</p>
          </div>

          <div className={styles.calculatorCard}>
            <div className={styles.priceLine}>
              <span>${acc.price}</span> / night
            </div>
            <div className={styles.calcRow}>
              <label>Check-in</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className={styles.calcRow}>
              <label>Check-out</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className={styles.calcRow}>
              <label>Guests</label>
              <input
                type="number"
                min="1"
                max={acc.guests || 10}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
            </div>
            <div className={styles.divider} />
            <div className={styles.total}>
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              type="button"
              className={styles.reserveBtn}
              onClick={handleReserve}
              disabled={reserveLoading}
            >
              {reserveLoading ? 'Reserving…' : 'Reserve'}
            </button>
            {reserveError && <p className={styles.reserveError}>{reserveError}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
