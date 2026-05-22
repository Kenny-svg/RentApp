import { createContext, useContext, useMemo, useState } from 'react';

const USERS_KEY = 'rentrate_users';
const SESSION_KEY = 'rentrate_session';

const AuthContext = createContext(null);

const loadUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const loadSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);
  const [users, setUsers] = useState(loadUsers);

  const signup = ({ name, email, password, role }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const exists = users.some((item) => item.email === normalizedEmail);
    if (exists) {
      return { ok: false, error: 'An account with this email already exists.' };
    }

    const nextUser = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      createdAt: new Date().toISOString()
    };

    const nextUsers = [...users, nextUser];
    setUsers(nextUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));

    const sessionUser = { id: nextUser.id, name: nextUser.name, email: nextUser.email, role: nextUser.role };
    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { ok: true, user: sessionUser };
  };

  const login = ({ email, password, role }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const matched = users.find((item) => item.email === normalizedEmail && item.password === password);
    if (!matched) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    if (matched.role !== role) {
      return { ok: false, error: `This account is registered as ${matched.role}.` };
    }

    const sessionUser = { id: matched.id, name: matched.name, email: matched.email, role: matched.role };
    setUser(sessionUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    return { ok: true, user: sessionUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, signup, logout }),
    [user]
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
