import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err) {
      console.log('Login error:', err);
      console.log('Response:', err.response);
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.email?.[0] ||
          'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>S</div>
          <span style={styles.logoText}>Semre Inventory</span>
        </div>

        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = '#1a7a4a')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = '#1a7a4a')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            ...styles.btn,
            opacity: loading ? 0.75 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f4c2a 0%, #1a7a4a 50%, #22c55e22 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', sans-serif",
    padding: '1rem',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '1.5rem',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1a7a4a, #22c55e)',
    color: '#fff',
    fontWeight: '800',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: '700',
    fontSize: '1.1rem',
    color: '#1a7a4a',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    margin: '0 0 1.5rem',
    color: '#6b7280',
    fontSize: '0.9rem',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#dc2626',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '0.65rem 0.9rem',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#111827',
  },
  btn: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #1a7a4a, #22c55e)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'opacity 0.2s',
  },
};
