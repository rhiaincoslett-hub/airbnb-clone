import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import styles from './HomePage.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Fallback inspiration cards when API has no data
const FALLBACK_INSPIRATION = [
  { name: 'Sandon City Hotel', distance: '53 km away', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', id: null },
  { name: 'Joburg City Hotel', distance: '188 km away', image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', id: null },
  { name: 'Woodmead Hotel', distance: '30 miles away', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', id: null },
  { name: 'Hyde Park Hotel', distance: '34 km away', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', id: null },
];

const EXPERIENCE_CARDS = [
  {
    title: 'Things to do on your trip',
    label: 'Experience',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  },
  {
    title: 'Things to do from home',
    label: 'Online Experiences',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  },
];

const GETAWAY_TABS = [
  'Destinations for arts & culture',
  'Destinations for outdoor adventure',
  'Mountain cabins',
  'Beach destinations',
  'Popular destinations',
  'Unique Stays',
];

const DESTINATIONS = [
  'Phoenix, Arizona',
  'San Francisco, California',
  'New York, England',
  'Hot Springs, Arkansas',
  'Barcelona, Spain',
  'London, England',
  'Los Angeles, California',
  'Prague, Czechia',
  'Scarborough, England',
  'San Diego, California',
  'Washington, District of Columbia',
];

const GUEST_OPTIONS = [
  { value: '', label: 'Add guests' },
  ...Array.from({ length: 16 }, (_, i) => ({ value: String(i + 1), label: i < 15 ? `${i + 1} guest${i > 0 ? 's' : ''}` : '16+ guests' })),
];

/**
 * Home page: hero with search, inspiration cards, experiences, gift cards, hosting banner, getaways.
 */
export function HomePage() {
  const [search, setSearch] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [inspirationCards, setInspirationCards] = useState(FALLBACK_INSPIRATION);
  const [activeTab, setActiveTab] = useState(0);
  const [showMoreDestinations, setShowMoreDestinations] = useState(false);
  const navigate = useNavigate();
  const stickyBarRef = useRef(null);
  const [openPopover, setOpenPopover] = useState(null); // 'when' | 'who' | null

  useEffect(() => {
    fetch(`${API_BASE}/api/accommodations`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data) && data.length >= 4) {
          setInspirationCards(
            data.slice(0, 4).map((a) => ({
              name: a.title || a.location || 'Accommodation',
              distance: a.location ? `${a.location}` : '',
              image: a.images?.[0] || FALLBACK_INSPIRATION[0].image,
              id: a._id,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (stickyBarRef.current && !stickyBarRef.current.contains(e.target)) {
        setOpenPopover(null);
      }
    }
    if (openPopover) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openPopover]);

  const formatDateRange = () => {
    if (!checkIn && !checkOut) return null;
    if (checkIn && !checkOut) return checkIn;
    if (!checkIn && checkOut) return checkOut;
    return `${checkIn} – ${checkOut}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set('location', search.trim());
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);
    navigate(`/locations?${params.toString()}`);
  };

  const displayedDestinations = showMoreDestinations ? DESTINATIONS : DESTINATIONS.slice(0, 8);
  const today = new Date().toISOString().slice(0, 10);
  const checkOutMin = checkIn || today;

  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Find your next stay</h1>
            <form className={styles.heroSearch} onSubmit={handleSearch}>
            <div className={styles.heroSearchField}>
              <div className={styles.heroSearchSegment}>
                <span className={styles.heroSearchLabel}>Location</span>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Location"
                />
              </div>
              <div className={styles.heroSearchDivider} />
              <div className={styles.heroSearchSegment}>
                <span className={styles.heroSearchLabel}>Check in</span>
                <input
                  type="date"
                  placeholder="Add dates"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={today}
                  aria-label="Check in"
                  className={styles.heroSearchDate}
                />
              </div>
              <div className={styles.heroSearchDivider} />
              <div className={styles.heroSearchSegment}>
                <span className={styles.heroSearchLabel}>Check out</span>
                <input
                  type="date"
                  placeholder="Add dates"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkOutMin}
                  aria-label="Check out"
                  className={styles.heroSearchDate}
                />
              </div>
              <div className={styles.heroSearchDivider} />
              <div className={styles.heroSearchSegment}>
                <span className={styles.heroSearchLabel}>Guests</span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  aria-label="Guests"
                  className={styles.heroSearchSelect}
                >
                  {GUEST_OPTIONS.map((opt) => (
                    <option key={opt.value || 'empty'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className={styles.heroSearchButton} aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                </button>
              </div>
            </form>
            <div className={styles.heroCta}>
              <p className={styles.heroCtaText}>Not sure where to go? Perfect.</p>
              <button type="button" className={styles.heroFlexibleBtn}>I&apos;m flexible</button>
            </div>
          </div>
        </section>

        {/* Sticky search + filters */}
        <div ref={stickyBarRef} className={styles.stickySearchBar}>
          <div className={styles.searchPillWrap}>
            <form className={styles.searchPill} onSubmit={handleSearch}>
            <input
              type="text"
              className={styles.searchPillSegment}
              placeholder="Where"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Where"
            />
            <div className={styles.searchPillDivider} />
            <div
              className={`${styles.searchPillSegment} ${styles.searchPillSegmentClickable} ${openPopover === 'when' ? styles.searchPillSegmentActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setOpenPopover((p) => (p === 'when' ? null : 'when'));
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenPopover((p) => (p === 'when' ? null : 'when'));
                }
              }}
              aria-label="When - Add dates"
            >
              <span className={`${styles.searchPillValue} ${!formatDateRange() ? styles.searchPillValuePlaceholder : ''}`}>
                {formatDateRange() || 'When'}
              </span>
            </div>
            <div className={styles.searchPillDivider} />
            <div
              className={`${styles.searchPillSegment} ${styles.searchPillSegmentClickable} ${openPopover === 'who' ? styles.searchPillSegmentActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setOpenPopover((p) => (p === 'who' ? null : 'who'));
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenPopover((p) => (p === 'who' ? null : 'who'));
                }
              }}
              aria-label="Who - Add guests"
            >
              <span className={`${styles.searchPillValue} ${!guests ? styles.searchPillValuePlaceholder : ''}`}>
                {guests ? `${guests} guest${guests === '1' ? '' : 's'}` : 'Who'}
              </span>
            </div>
            <div className={styles.searchPillDivider} />
            <button type="submit" className={styles.searchPillBtn} aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>
          {openPopover === 'when' && (
            <div className={styles.popover} onClick={(e) => e.stopPropagation()}>
              <div className={styles.popoverTitle}>Check in – Check out</div>
              <div className={styles.popoverDateRow}>
                <label className={styles.popoverLabel}>
                  <span>Check in</span>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={today}
                    aria-label="Check in"
                    className={styles.popoverDateInput}
                  />
                </label>
                <label className={styles.popoverLabel}>
                  <span>Check out</span>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkOutMin}
                    aria-label="Check out"
                    className={styles.popoverDateInput}
                  />
                </label>
              </div>
            </div>
          )}
          {openPopover === 'who' && (
            <div className={styles.popover} onClick={(e) => e.stopPropagation()}>
              <div className={styles.popoverTitle}>Guests</div>
              <div className={styles.popoverGuestList}>
                {GUEST_OPTIONS.map((opt) => (
                  <button
                    key={opt.value || 'empty'}
                    type="button"
                    className={`${styles.popoverGuestOption} ${guests === opt.value ? styles.popoverGuestOptionActive : ''}`}
                    onClick={() => {
                      setGuests(opt.value);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          </div>
          <div className={styles.filterPills}>
            <button type="button" className={styles.filterPill}>Entire homes</button>
            <button type="button" className={styles.filterPill}>Cabins</button>
            <button type="button" className={styles.filterPill}>Unique stays</button>
            <button type="button" className={styles.filterPill}>Pets allowed</button>
            <button type="button" className={styles.filterPill}>
              <span className={styles.filterPillIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M2 14h4M12 8h4M18 12h4" />
                </svg>
              </span>
              Filters
            </button>
            <button type="button" className={styles.filterPill}>Display total before taxes</button>
          </div>
        </div>

        {/* Inspiration for your next trip */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Inspiration for your next trip</h2>
          <div className={styles.inspirationScroll}>
            {inspirationCards.map((card, i) => (
              <Link
                key={card.id || i}
                to={card.id ? `/locations/${card.id}` : '/locations'}
                className={styles.inspirationCard}
              >
                <img src={card.image} alt="" />
                <div className={styles.inspirationOverlay}>
                  <span className={styles.inspirationName}>{card.name}</span>
                  {card.distance && <span className={styles.inspirationDistance}>{card.distance}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Discover Airbnb Experiences */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Discover Airbnb Experiences</h2>
          <div className={styles.experienceGrid}>
            {EXPERIENCE_CARDS.map((exp, i) => (
              <div key={i} className={styles.experienceCard}>
                <img src={exp.image} alt="" />
                <div className={styles.experienceOverlay}>
                  <h3 className={styles.experienceTitle}>{exp.title}</h3>
                  <button type="button" className={styles.experienceBtn}>{exp.label}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shop Airbnb gift cards */}
        <section className={styles.section}>
          <div className={styles.shopSection}>
            <div className={styles.shopContent}>
              <h2 className={styles.sectionTitle}>Shop Airbnb gift cards</h2>
              <button type="button" className={styles.learnMoreBtn}>Learn more</button>
            </div>
            <div className={styles.giftCardsWrap}>
              <div className={styles.giftCard} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1499002232090-f1911c2b34e2?w=300')" }} />
              <div className={styles.giftCard} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300')" }} />
              <div className={styles.giftCard} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519046904884-53103b34b206?w=300')" }} />
            </div>
          </div>
        </section>

        {/* Questions about hosting */}
        <section className={styles.hostingSection}>
          <div className={styles.hostingBanner}>
            <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200" alt="" />
            <div className={styles.hostingOverlay}>
              <h2 className={styles.hostingTitle}>Questions about hosting?</h2>
              <button type="button" className={styles.superhostBtn}>Ask a Superhost</button>
            </div>
          </div>
        </section>

        {/* Inspiration for future getaways */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Inspiration for future getaways</h2>
          <div className={styles.tabs}>
            {GETAWAY_TABS.map((tab, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.tab} ${i === activeTab ? styles.active : ''}`}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className={styles.destinationsGrid}>
            {displayedDestinations.map((dest) => (
              <Link key={dest} to={`/locations?location=${encodeURIComponent(dest.split(',')[0])}`} className={styles.destinationLink}>
                {dest}
              </Link>
            ))}
          </div>
          {!showMoreDestinations && (
            <button type="button" className={styles.showMoreBtn} onClick={() => setShowMoreDestinations(true)}>
              Show more
            </button>
          )}
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <h4>Support</h4>
              <a href="#help">Help Centre</a>
              <a href="#safety">Safety</a>
              <a href="#cancellation">Cancellation</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Hosting</h4>
              <a href="#host">Host your home</a>
              <a href="#host-responsibility">Host responsibility</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#careers">Careers</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© {new Date().getFullYear()} Airbnb, Inc.</span>
            <div className={styles.socialLinks}>
              <a href="#twitter">Twitter</a>
              <a href="#facebook">Facebook</a>
              <a href="#instagram">Instagram</a>
            </div>
            <div>
              <select aria-label="Language">
                <option>English</option>
              </select>
              <select aria-label="Currency" style={{ marginLeft: 'var(--spacing-sm)' }}>
                <option>USD</option>
              </select>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
