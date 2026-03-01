import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { API_BASE } from '../api';
import styles from './LoginPage.module.css';

/**
 * Register form: username/password, POST /api/users/register with role host,
 * then log in and redirect to /admin.
 */
export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!username.trim()) next.username = 'Username is required';
    if (!password) next.password = 'Password is required';
    else if (password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.message || 'Registration failed');
        return;
      }
      login(data.token);
      const userRole = data.user?.role ?? role;
      navigate(userRole === 'host' ? '/admin' : '/');
    } catch (err) {
      setServerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Create an account</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {serverError && <div className={styles.serverError} role="alert">{serverError}</div>}
        <div className={styles.roleRow}>
          <span className={styles.roleLabel}>I want to</span>
          <div className={styles.roleOptions}>
            <label className={styles.roleOption}>
              <input type="radio" name="role" value="user" checked={role === 'user'} onChange={(e) => setRole(e.target.value)} />
              <span>Book stays</span>
            </label>
            <label className={styles.roleOption}>
              <input type="radio" name="role" value="host" checked={role === 'host'} onChange={(e) => setRole(e.target.value)} />
              <span>List my place</span>
            </label>
          </div>
        </div>
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          autoComplete="username"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <Button type="submit" label={loading ? 'Creating account…' : 'Register'} disabled={loading} />
      </form>
      <p className={styles.switch}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
