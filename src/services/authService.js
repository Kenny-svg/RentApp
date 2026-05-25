import { supabase } from '../lib/supabaseClient';

const ensureRole = (role) => (role === 'landlord' ? 'landlord' : 'tenant');
const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const signUpUser = async ({
  email,
  password,
  fullName,
  role,
  phone,
  tenantIntent,
  landlordEmail
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        phone,
        tenant_intent: tenantIntent || null,
        landlord_email: landlordEmail ? normalizeEmail(landlordEmail) : null
      }
    }
  });

  if (error) throw error;
  return data;
};

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    const isMissingSession =
      error.name === 'AuthSessionMissingError' ||
      error.message?.toLowerCase().includes('auth session missing');

    if (isMissingSession) return null;
    throw error;
  }
  return data?.session?.user ?? null;
};

export const createUserProfile = async ({ userId, fullName, email, phone, role }) => {
  const normalizedRole = ensureRole(role);

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      user_id: userId,
      full_name: fullName,
      email: normalizeEmail(email),
      phone: phone || null,
      role: normalizedRole
    },
    { onConflict: 'user_id' }
  );

  if (profileError) throw profileError;

  if (normalizedRole === 'landlord') {
    const { error } = await supabase
      .from('landlord_profiles')
      .upsert({ user_id: userId }, { onConflict: 'user_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('tenant_profiles').upsert(
      {
        user_id: userId
      },
      { onConflict: 'user_id' }
    );
    if (error) throw error;
  }
};
