import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Header.module.css';

/**
 * Site header: logo, location search, and auth-dependent right section.
 * Logged out: "Become a host". Logged in: greeting + dropdown (View Reservations, Logout).
 */
export function Header() {
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/locations?location=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <img src="/airbnb-logo.png" alt="airbnb" />
      </Link>

      <form className={styles.searchWrap} onSubmit={handleSearch}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search destinations"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search locations"
        />
      </form>

      <div className={styles.right}>
        {!user ? (
          <Link to="/admin" className={styles.becomeHost}>
            Become a host
          </Link>
        ) : (
          <div className={styles.dropdown} ref={dropdownRef}>
            <button
              type="button"
              className={styles.dropdownToggle}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span className={styles.greeting}>Hello, {user.username}</span>
            </button>
            {dropdownOpen && (
              <ul className={styles.dropdownMenu}>
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
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
