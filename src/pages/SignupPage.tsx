import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthCard } from '../components/AuthCard';
import { useSession } from '../hooks/useSession';
import { signUp } from '../services/authService';

export default function SignupPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.trim();

    if (!email || !password || !cleanUsername) {
      toast.error('Email, username, and password are required.');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,18}$/.test(cleanUsername)) {
      toast.error('Use 3-18 letters, numbers, or underscores for your username.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password needs at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      await signUp(email, password, cleanUsername);
      toast.success('Island created.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create your island.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Claim your island" subtitle="Start with a hut, a small army, and enough gold to make trouble.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            autoComplete="nickname"
            maxLength={18}
            onChange={(event) => setUsername(event.target.value)}
            value={username}
          />
        </label>
        <label>
          Email
          <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
        </label>
        <label>
          Password
          <input
            autoComplete="new-password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        <button disabled={submitting} type="submit">
          {submitting ? 'Building...' : 'Create island'}
        </button>
      </form>
      <p className="auth-switch">
        Already sailing? <Link to="/login">Log in</Link>
      </p>
    </AuthCard>
  );
}
