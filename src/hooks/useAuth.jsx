import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  createUserProfile,
  getCurrentUser,
  loginUser,
  logoutUser,
  signUpUser
} from '../services/authService';
import { getProfile } from '../services/profileService';
import { ensureTenantLinkRequest as ensureTenantLinkRequestRecord } from '../services/tenantLinkService';

const AuthContext = createContext(null);

const LANDLORD_ROLE = 'landlord';
const TENANT_ROLE = 'tenant';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const safeGetProfile = async (userId) => {
    try {
      return await getProfile(userId);
    } catch {
      return null;
    }
  };

  const hydrateFromSupabaseUser = async (supabaseUser) => {
    if (!supabaseUser) {
      setUser(null);
      setProfile(null);
      return;
    }

    let dbProfile = await safeGetProfile(supabaseUser.id);

    if (!dbProfile && supabaseUser.user_metadata?.role) {
      try {
        await createUserProfile({
          userId: supabaseUser.id,
          fullName: supabaseUser.user_metadata?.full_name || 'User',
          email: supabaseUser.email,
          phone: supabaseUser.user_metadata?.phone || null,
          role: supabaseUser.user_metadata.role
        });
      } catch {
        // profile bootstrap can fail temporarily under strict RLS until next session refresh
      }
      dbProfile = await safeGetProfile(supabaseUser.id);
    }

    const role = dbProfile?.role || TENANT_ROLE;

    if (role === TENANT_ROLE && supabaseUser.user_metadata?.tenant_intent === 'have_landlord') {
      const landlordEmail = supabaseUser.user_metadata?.landlord_email || '';
      if (landlordEmail) {
        try {
          await ensureTenantLinkRequestRecord({
            tenantId: supabaseUser.id,
            tenantName: dbProfile?.full_name || supabaseUser.user_metadata?.full_name || 'Tenant',
            tenantEmail: dbProfile?.email || supabaseUser.email || '',
            landlordEmail
          });
        } catch {
          // Non-blocking: tenant can still use app and retry later.
        }
      }
    }

    setProfile(dbProfile || null);
    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: dbProfile?.full_name || supabaseUser.user_metadata?.full_name || 'User',
      role
    });
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) await hydrateFromSupabaseUser(currentUser);
      } catch (error) {
        if (mounted) {
          // Keep app usable in logged-out state even if auth bootstrap fails.
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setLoading(false);

      // Avoid async Supabase calls directly inside auth callback to prevent deadlocks.
      setTimeout(() => {
        if (!mounted) return;
        hydrateFromSupabaseUser(session?.user ?? null).catch(() => {
          if (!mounted) return;
          setUser(null);
          setProfile(null);
        });
      }, 0);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signup = async ({
    fullName,
    email,
    password,
    phone,
    role,
    tenantIntent,
    landlordEmail
  }) => {
    const normalizedRole = role === LANDLORD_ROLE ? LANDLORD_ROLE : TENANT_ROLE;
    const signupData = await signUpUser({
      email,
      password,
      fullName,
      role: normalizedRole,
      phone,
      tenantIntent,
      landlordEmail
    });

    const createdUser = signupData.user ?? signupData.session?.user;
    if (!createdUser) {
      return {
        ok: true,
        needsEmailConfirmation: true,
        message: 'Signup successful. Please confirm your email before logging in.'
      };
    }

    try {
      await createUserProfile({
        userId: createdUser.id,
        fullName,
        email,
        phone,
        role: normalizedRole
      });

      if (normalizedRole === TENANT_ROLE && tenantIntent === 'have_landlord' && landlordEmail) {
        try {
          await ensureTenantLinkRequestRecord({
            tenantId: createdUser.id,
            tenantName: fullName,
            tenantEmail: email,
            landlordEmail
          });
        } catch {
          // Non-blocking: request can be retried after login once migrations are applied.
        }
      }
    } catch (error) {
      if (!signupData.session) {
        return {
          ok: true,
          needsEmailConfirmation: true,
          message: 'Signup successful. Confirm your email, then login to finish profile setup.'
        };
      }
      throw error;
    }

    const dbProfile = await safeGetProfile(createdUser.id);
    const nextProfile = dbProfile || null;
    setProfile(nextProfile);
    setUser({
      id: createdUser.id,
      email: createdUser.email,
      name: nextProfile?.full_name || fullName,
      role: nextProfile?.role || normalizedRole
    });

    return { ok: true, user: createdUser };
  };

  const login = async ({ email, password }) => {
    const loginData = await loginUser({ email, password });
    const currentUser = loginData.user;

    const roleFromMetadata = currentUser?.user_metadata?.role;
    const resolvedRole = roleFromMetadata === LANDLORD_ROLE ? LANDLORD_ROLE : TENANT_ROLE;

    setUser((prev) => ({
      id: currentUser.id,
      email: currentUser.email,
      name: prev?.name || currentUser.user_metadata?.full_name || 'User',
      role: resolvedRole
    }));

    // Hydrate full profile asynchronously without blocking login redirect.
    hydrateFromSupabaseUser(currentUser).catch(() => {});

    return {
      ok: true,
      user: {
        id: currentUser.id,
        email: currentUser.email,
        role: resolvedRole
      }
    };
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const refreshUserContext = async () => {
    const currentUser = await getCurrentUser();
    await hydrateFromSupabaseUser(currentUser);
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAuthenticated: Boolean(user),
      signup,
      login,
      logout,
      refreshUserContext
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
