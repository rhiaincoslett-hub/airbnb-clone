import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import styles from './LoginPage.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Login form: username/password, client validation, POST /api/users/login,
 * store token via AuthContext, redirect to /admin on success.
 */
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(data.message || 'Login failed. Create an account if you don’t have one.');
        return;
      }
      login(data.token);
      const role = data.user?.role ?? (() => { try { return JSON.parse(atob(data.token.split('.')[1])).role; } catch { return 'user'; } })();
      navigate(role === 'host' ? '/admin' : '/');
    } catch (err) {
      setServerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Log in</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {serverError && <div className={styles.serverError} role="alert">{serverError}</div>}
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
          autoComplete="current-password"
        />
        <Button type="submit" label={loading ? 'Logging in…' : 'Log in'} disabled={loading} />
      </form>
      <p className={styles.switch}>
        Don&apos;t have an account? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}
