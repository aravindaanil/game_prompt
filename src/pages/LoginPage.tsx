import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthCard } from '../components/AuthCard';
import { useSession } from '../hooks/useSession';
import { signIn } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required.');
      return;
    }

    try {
      setSubmitting(true);
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not log in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Welcome back, captain" subtitle="Collect your gold, tune up the island, and see who ruled the tide.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
        </label>
        <label>
          Password
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        <button disabled={submitting} type="submit">
          {submitting ? 'Opening island...' : 'Log in'}
        </button>
      </form>
      <p className="auth-switch">
        New around here? <Link to="/signup">Create an island</Link>
      </p>
    </AuthCard>
  );
}
