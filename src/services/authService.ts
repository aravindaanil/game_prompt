import { supabase } from '../lib/supabase';

function fallbackUsername(email?: string): string {
  const base = email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 14) || 'captain';
  return `${base}_${Math.floor(Math.random() * 1000)}`.slice(0, 18);
}

export async function ensurePlayerProfile(preferredUsername?: string) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('Not authenticated');

  const username =
    preferredUsername ||
    (typeof user.user_metadata.username === 'string' ? user.user_metadata.username : undefined) ||
    fallbackUsername(user.email);

  const { data, error: profileError } = await supabase.rpc('create_player_profile', {
    requested_username: username,
  });

  if (profileError) throw profileError;
  return data;
}

export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) throw error;

  if (data.session) {
    await ensurePlayerProfile(username);
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await ensurePlayerProfile();
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
