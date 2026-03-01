import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';

/**
 * Site header: Airbnb logo, center nav (Stays, Experiences, Online Experiences),
 * right: Become a Host, globe, user menu.
 */
export function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <img src="/airbnb-logo.png" alt="airbnb" />
      </Link>

      <nav className={styles.navCenter} aria-label="Main">
        <Link to="/" className={`${styles.navLink} ${isHome ? styles.active : ''}`}>
          Stays
        </Link>
        <Link to="/" className={styles.navLink}>
          Experiences
        </Link>
        <Link to="/" className={styles.navLink}>
          Online Experiences
        </Link>
      </nav>

      <div className={styles.right}>
        <Link to={user?.role === 'host' ? '/admin' : '/admin'} className={styles.becomeHost}>
          Become a Host
        </Link>
        <button type="button" className={styles.iconButton} aria-label="Language and region">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </button>
        <div className={styles.dropdown} ref={dropdownRef}>
          <button
            type="button"
            className={styles.userMenu}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5">
              <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
            </svg>
            <span className={styles.profileIcon}>
              {user ? user.username?.charAt(0)?.toUpperCase() || 'U' : '?'}
            </span>
          </button>
          {dropdownOpen && (
            <ul className={styles.dropdownMenu}>
              {user ? (
                <>
                  <li>
                    <Link to="/reservations" onClick={() => setDropdownOpen(false)}>
                      {user.role === 'host' ? 'Reservations' : 'My reservations'}
                    </Link>
                  </li>
                  <li>
                    {user.role === 'host' ? (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}>
                        Your listings
                      </Link>
                    ) : (
                      <Link to="/register" onClick={() => setDropdownOpen(false)}>
                        Become a host
                      </Link>
                    )}
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                        navigate('/');
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" onClick={() => setDropdownOpen(false)}>
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" onClick={() => setDropdownOpen(false)}>
                      Sign up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
