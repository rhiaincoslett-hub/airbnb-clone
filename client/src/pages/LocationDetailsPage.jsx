import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import styles from './LocationDetailsPage.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Sample data for sections not yet from API
const REVIEW_COUNT = 7;
const RATING = 5.0;
const RATING_CATEGORIES = [
  { label: 'Cleanliness', score: 5 },
  { label: 'Communication', score: 5 },
  { label: 'Check-in', score: 5 },
  { label: 'Accuracy', score: 5 },
  { label: 'Location', score: 5 },
  { label: 'Value', score: 5 },
];
const SAMPLE_REVIEWS = [
  { name: 'Elana', month: 'February 2022', text: 'Great stay, exactly as described. The place was clean and the host was very responsive.' },
  { name: 'James', month: 'January 2022', text: 'Lovely apartment in a perfect location. Would definitely recommend.' },
];
const AMENITY_ICONS = {
  Wifi: '📶',
  Kitchen: '🍳',
  'Free parking': '🅿️',
  'Dedicated workspace': '💻',
  'Air conditioning': '❄️',
  Washer: '🧺',
  Dryer: '🔥',
  Dishwasher: '🍽️',
  TV: '📺',
  'Hair dryer': '💨',
  Hangers: '👔',
  Essentials: '🧴',
  Iron: '👕',
  'Smoke alarm': '🚨',
  'Carbon monoxide alarm': '⚠️',
};

/**
 * Compute price breakdown and total.
 */
function getPriceBreakdown(acc, start, end) {
  if (!acc?.price || !start || !end) return null;
  const nights = Math.max(0, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
  let base = acc.price * nights;
  const weeklyDiscount = (acc.weeklyDiscount || 0) / 100;
  if (weeklyDiscount > 0 && nights >= 7) base *= 1 - weeklyDiscount;
  const cleaningFee = acc.cleaningFee || 0;
  const serviceFee = acc.serviceFee || 0;
  const taxes = acc.occupancyTaxes || 0;
  return {
    basePerNight: acc.price,
    nights,
    base,
    cleaningFee,
    serviceFee,
    taxes,
    total: base + cleaningFee + serviceFee + taxes,
  };
}

/** Get YYYY-MM-DD for a date at midnight. */
function toDateKey(d) {
  return d.toISOString().slice(0, 10);
}

/** Build calendar cells for a month: leading blanks + day numbers. */
function getCalendarDays(year, month, startDate, endDate, todayKey) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstDay = first.getDay();
  const daysInMonth = last.getDate();
  const cells = [];

  for (let i = 0; i < firstDay; i++) {
    cells.push({ key: `empty-${i}`, empty: true });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = toDateKey(new Date(year, month, day));
    const isPast = dateKey < todayKey;
    const isStart = dateKey === startDate;
    const isEnd = dateKey === endDate;
    const start = startDate || '';
    const end = endDate || '';
    const isInRange = start && end && dateKey > start && dateKey < end;
    cells.push({
      key: dateKey,
      dateKey,
      day,
      empty: false,
      isPast,
      isStart,
      isEnd,
      isInRange,
    });
  }
  return cells;
}

/**
 * Detail page: gallery, full listing details, sticky booking panel.
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
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [saved, setSaved] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/accommodations/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Listing not found');
        return res.json();
      })
      .then((data) => {
        setAcc(data);
        setGuests(data.guests ? Math.min(guests, data.guests) : 1);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  const breakdown = acc ? getPriceBreakdown(acc, start, end) : null;
  const today = new Date().toISOString().slice(0, 10);
  const endMin = startDate || today;

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
          totalPrice: breakdown?.total ?? 0,
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

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

  const handleCalendarDayClick = (dateKey) => {
    if (!dateKey) return;
    if (!startDate) {
      setStartDate(dateKey);
      setEndDate('');
      return;
    }
    if (!endDate) {
      if (dateKey <= startDate) {
        setStartDate(dateKey);
        setEndDate('');
      } else {
        setEndDate(dateKey);
      }
      return;
    }
    setStartDate(dateKey);
    setEndDate('');
  };

  const goCalendarPrev = () => {
    setCalendarMonth((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const goCalendarNext = () => {
    setCalendarMonth((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (error || !acc) return <div className={styles.error}>{error || 'Not found'}</div>;

  const images = acc.images?.length ? acc.images : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'];
  const mainImage = images[0];
  const gridImages = images.slice(1, 5);
  const hostName = acc.host?.username || 'Host';
  const breadcrumbs = ['All', acc.type || 'Place', acc.location, 'Location'].filter(Boolean);
  const amenitiesList = acc.amenities?.length ? acc.amenities : ['Wifi', 'Kitchen', 'TV', 'Essentials', 'Air conditioning'];
  const displayedAmenities = showAllAmenities ? amenitiesList : amenitiesList.slice(0, 16);
  const description = acc.description || 'Relax and enjoy your stay in this comfortable space. The property offers everything you need for a memorable trip.';

  return (
    <>
      <Header />
      <div className={styles.container}>
        {/* Page header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>{acc.title}</h1>
            <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, i) => (
                <span key={i}>
                  {i > 0 && <span className={styles.breadcrumbSep}> &gt; </span>}
                  <span>{crumb}</span>
                </span>
              ))}
            </nav>
          </div>
          <div className={styles.headerActions}>
            <button type="button" className={styles.headerActionBtn}>
              <span className={styles.headerActionIcon} aria-hidden>⎘</span>
              Share
            </button>
            <button
              type="button"
              className={styles.headerActionBtn}
              onClick={() => setSaved(!saved)}
              aria-pressed={saved}
            >
              <span className={styles.headerActionIcon} aria-hidden>{saved ? '♥' : '♡'}</span>
              Save
            </button>
          </div>
        </div>

        {/* Gallery: main + 2x2 grid */}
        <div className={styles.gallery}>
          <div className={styles.galleryMain}>
            <img src={mainImage} alt="" />
          </div>
          <div className={styles.galleryGrid}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.galleryGridItem}>
                <img src={gridImages[i] || mainImage} alt="" />
              </div>
            ))}
          </div>
          <a href="#gallery" className={styles.allPhotosBtn}>
            <span className={styles.allPhotosIcon}>☷</span>
            All photos
          </a>
        </div>

        <div className={styles.twoCol}>
          {/* Left column */}
          <div className={styles.details}>
            {/* Host + summary */}
            <section className={styles.section}>
              <div className={styles.hostRow}>
                <div>
                  <h2 className={styles.listingType}>
                    {acc.type || 'Entire home'} hosted by {hostName}
                  </h2>
                  <p className={styles.summary}>
                    {acc.guests ?? 2} guests · {acc.bedrooms ?? 1} bedroom · {acc.bedrooms ?? 1} bed · {acc.bathrooms ?? 1} bath
                  </p>
                </div>
                <div className={styles.hostAvatarWrap}>
                  <div className={styles.hostAvatar} aria-hidden />
                  <span className={styles.hostAvatarName}>{hostName}</span>
                </div>
              </div>
            </section>

            <hr className={styles.divider} />

            {/* Key features */}
            <section className={styles.section}>
              <div className={styles.feature}>
                <span className={styles.featureIcon} aria-hidden>🖥</span>
                <div>
                  <strong>Dedicated workspace</strong>
                  <p className={styles.featureDesc}>A common area with Wi-Fi that&apos;s well-suited for working.</p>
                </div>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon} aria-hidden>🔑</span>
                <div>
                  <strong>Self check-in</strong>
                  <p className={styles.featureDesc}>Check yourself in with the smart lock.</p>
                </div>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon} aria-hidden>★</span>
                <div>
                  <strong>{hostName} is a Superhost</strong>
                  <p className={styles.featureDesc}>Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.</p>
                </div>
              </div>
            </section>

            <hr className={styles.divider} />

            {/* Description */}
            <section className={styles.section}>
              <p className={styles.description}>
                {showFullDescription ? description : `${description.slice(0, 120)}${description.length > 120 ? '…' : ''}`}
              </p>
              {description.length > 120 && (
                <button type="button" className={styles.showMoreBtn} onClick={() => setShowFullDescription(!showFullDescription)}>
                  {showFullDescription ? 'Show less' : 'Show more'} &gt;
                </button>
              )}
            </section>

            <hr className={styles.divider} />

            {/* Where you'll sleep */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Where you&apos;ll sleep</h3>
              <div className={styles.bedroomCard}>
                <div className={styles.bedroomCardImage} style={{ backgroundImage: `url(${mainImage})` }} />
                <div className={styles.bedroomCardText}>
                  <strong>Bedroom 1</strong>
                  <span>1 Queen bed</span>
                </div>
              </div>
            </section>

            <hr className={styles.divider} />

            {/* Amenities */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>What this place offers</h3>
              <div className={styles.amenitiesGrid}>
                {displayedAmenities.map((a, i) => (
                  <div key={i} className={styles.amenityItem}>
                    <span className={styles.amenityIcon}>{AMENITY_ICONS[a] || '•'}</span>
                    <span>{a}</span>
                  </div>
                ))}
              </div>
              {amenitiesList.length > 16 && (
                <button type="button" className={styles.showMoreBtn} onClick={() => setShowAllAmenities(!showAllAmenities)}>
                  {showAllAmenities ? 'Show less' : `Show all ${amenitiesList.length} amenities`} &gt;
                </button>
              )}
            </section>

            <hr className={styles.divider} />

            {/* Calendar */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                {breakdown?.nights ? `${breakdown.nights} nights in ${acc.location}` : `Dates`}
              </h3>
              {startDate && endDate && (
                <p className={styles.selectedDates}>
                  {formatDate(startDate)} – {formatDate(endDate)}
                </p>
              )}
              <div className={styles.calendarWrap}>
                <div className={styles.calendarNav}>
                  <button type="button" className={styles.calendarNavBtn} onClick={goCalendarPrev} aria-label="Previous month">
                    ←
                  </button>
                  <button type="button" className={styles.calendarNavBtn} onClick={goCalendarNext} aria-label="Next month">
                    →
                  </button>
                </div>
                <div className={styles.calendarMonths}>
                  {[0, 1].map((offset) => {
                    const y = calendarMonth.month + offset > 11 ? calendarMonth.year + 1 : calendarMonth.year;
                    const m = (calendarMonth.month + offset) % 12;
                    const monthLabel = new Date(y, m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    const cells = getCalendarDays(y, m, startDate, endDate, today);
                    return (
                      <div key={`${y}-${m}`} className={styles.calendarMonth}>
                        <header>{monthLabel}</header>
                        <div className={styles.calendarDays}>
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <span key={i} className={styles.calendarDayHead}>{d}</span>
                          ))}
                          {cells.map((cell) =>
                            cell.empty ? (
                              <span key={cell.key} className={styles.calendarDayEmpty} />
                            ) : (
                              <button
                                key={cell.key}
                                type="button"
                                className={`${styles.calendarDay} ${cell.isPast ? styles.calendarDayPast : ''} ${cell.isStart || cell.isEnd ? styles.calendarDaySelected : ''} ${cell.isInRange ? styles.calendarDayInRange : ''}`}
                                onClick={() => handleCalendarDayClick(cell.dateKey)}
                                disabled={cell.isPast}
                                aria-label={`Select ${cell.dateKey}`}
                              >
                                {cell.day}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button type="button" className={styles.clearDatesBtn} onClick={() => { setStartDate(''); setEndDate(''); }}>
                  Clear dates
                </button>
              </div>
            </section>

            <hr className={styles.divider} />

            {/* Reviews */}
            <section className={styles.section}>
              <div className={styles.reviewsHeader}>
                <h3 className={styles.sectionTitle}>★ {RATING} · {REVIEW_COUNT} reviews</h3>
              </div>
              <div className={styles.ratingBars}>
                {RATING_CATEGORIES.map((r, i) => (
                  <div key={i} className={styles.ratingBarRow}>
                    <span>{r.label}</span>
                    <div className={styles.ratingBarTrack}><div className={styles.ratingBarFill} style={{ width: '100%' }} /></div>
                    <span className={styles.ratingBarScore}>{r.score}.0</span>
                  </div>
                ))}
              </div>
              <div className={styles.reviewCards}>
                {SAMPLE_REVIEWS.map((rev, i) => (
                  <div key={i} className={styles.reviewCard}>
                    <div className={styles.reviewCardHeader}>
                      <div className={styles.reviewerAvatar} aria-hidden />
                      <div>
                        <strong>{rev.name}</strong>
                        <span className={styles.reviewDate}>{rev.month}</span>
                      </div>
                    </div>
                    <p className={styles.reviewText}>{rev.text}</p>
                    <button type="button" className={styles.showMoreBtn}>Show more &gt;</button>
                  </div>
                ))}
              </div>
              <button type="button" className={styles.showAllReviewsBtn}>Show all {REVIEW_COUNT} reviews</button>
            </section>

            <hr className={styles.divider} />

            {/* Host profile */}
            <section className={styles.section}>
              <div className={styles.hostProfile}>
                <div className={styles.hostAvatarLarge} aria-hidden />
                <div className={styles.hostProfileInfo}>
                  <h3 className={styles.sectionTitle}>Hosted by {hostName}</h3>
                  <p>Joined in February 2022</p>
                  <p>3 reviews · Identity verified · Superhost</p>
                  <p className={styles.hostBio}>Hi, I&apos;m {hostName}. I love hosting and making sure guests have a great stay.</p>
                  <button type="button" className={styles.contactHostBtn}>Contact host</button>
                  <p className={styles.hostMeta}>Languages: English</p>
                  <p className={styles.hostMeta}>Response rate: 100% · Response time: within an hour</p>
                </div>
              </div>
            </section>

            <hr className={styles.divider} />

            {/* Things to know */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Things to know</h3>
              <div className={styles.thingsGrid}>
                <div>
                  <h4 className={styles.thingsSubtitle}>House rules</h4>
                  <p>Check-in after 3:00 PM, check-out before 11:00 AM. Self check-in with smart lock. No smoking. No parties or events. Pets allowed.</p>
                  <button type="button" className={styles.showMoreBtn}>Show all &gt;</button>
                </div>
                <div>
                  <h4 className={styles.thingsSubtitle}>Health & safety</h4>
                  <p>This property is committed to an enhanced cleaning process. Carbon monoxide alarm and smoke alarm installed.</p>
                  <button type="button" className={styles.showMoreBtn}>Show all &gt;</button>
                </div>
                <div>
                  <h4 className={styles.thingsSubtitle}>Cancellation policy</h4>
                  <p>Add your trip dates to get the cancellation details for this stay.</p>
                  <button type="button" className={styles.showMoreBtn}>Show all &gt;</button>
                </div>
              </div>
            </section>
          </div>

          {/* Right column: sticky booking panel */}
          <aside className={styles.bookingPanel}>
            <div className={styles.bookingCard}>
              <div className={styles.bookingPriceRow}>
                <span className={styles.bookingPrice}>${acc.price}</span>
                <span> / night</span>
              </div>
              <p className={styles.bookingRating}>★ {RATING} · {REVIEW_COUNT} reviews</p>

              <div className={styles.bookingInputs}>
                <div className={styles.bookingInputRow}>
                  <div className={styles.bookingField}>
                    <label>CHECK-IN</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={today}
                      aria-label="Check-in"
                    />
                  </div>
                  <div className={styles.bookingField}>
                    <label>CHECKOUT</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={endMin}
                      aria-label="Check-out"
                    />
                  </div>
                </div>
                <div className={styles.bookingField}>
                  <label>GUESTS</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    aria-label="Guests"
                  >
                    {Array.from({ length: acc.guests || 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                className={styles.bookNowBtn}
                onClick={handleReserve}
                disabled={reserveLoading}
              >
                {reserveLoading ? 'Reserving…' : 'Book now'}
              </button>

              {reserveError && <p className={styles.reserveError}>{reserveError}</p>}

              {breakdown && (
                <>
                  <div className={styles.priceBreakdown}>
                    <div className={styles.priceBreakdownRow}>
                      <span>${breakdown.basePerNight} x {breakdown.nights} nights</span>
                      <span>${breakdown.base.toFixed(0)}</span>
                    </div>
                    {breakdown.cleaningFee > 0 && (
                      <div className={styles.priceBreakdownRow}>
                        <span>Cleaning fee</span>
                        <span>${breakdown.cleaningFee}</span>
                      </div>
                    )}
                    {breakdown.serviceFee > 0 && (
                      <div className={styles.priceBreakdownRow}>
                        <span>Service fee</span>
                        <span>${breakdown.serviceFee}</span>
                      </div>
                    )}
                    {breakdown.taxes > 0 && (
                      <div className={styles.priceBreakdownRow}>
                        <span>Taxes</span>
                        <span>${breakdown.taxes}</span>
                      </div>
                    )}
                  </div>
                  <hr className={styles.divider} />
                  <div className={styles.totalRow}>
                    <strong>Total</strong>
                    <strong>${breakdown.total.toFixed(0)}</strong>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
