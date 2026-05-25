import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import Button from './Button';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const dashboardPath = user?.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant';
  const navLinks = [];

  if (!isAuthenticated || user?.role === 'tenant') {
    navLinks.push({ label: 'Properties', to: '/properties' });
  }

  if (isAuthenticated) {
    navLinks.push({ label: 'Profile', to: '/profile' });
    navLinks.push({ label: 'Dashboard', to: dashboardPath });
    if (user.role === 'landlord') navLinks.push({ label: 'Add Property', to: '/add-property' });
  }

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setIsOpen(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="glass-header sticky top-0 z-40 border-b border-white/30 bg-white/65 backdrop-blur-xl shadow-[0_8px_26px_rgba(15,23,42,0.1)]">
      <div className="container-app relative flex h-16 items-center justify-between">
        <div className="pointer-events-none absolute left-24 top-1/2 h-7 w-28 -translate-y-1/2 rounded-full bg-brand-300/35 blur-2xl animate-float-soft" />
        <Link to="/" className="text-xl font-extrabold tracking-tight text-brand-700">
          RentRate
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative py-1 text-sm font-medium transition after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:rounded-full after:bg-brand-600 after:transition-all after:duration-300 ${
                  isActive
                    ? 'text-brand-700 after:w-full'
                    : 'text-slate-700 after:w-0 hover:text-slate-900 hover:after:w-full'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <p className="text-sm text-slate-600">Hi, {user.name}</p>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        <button className="md:hidden" onClick={() => setIsOpen((prev) => !prev)} aria-label="Toggle menu">
          {isOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-white/40 bg-white/80 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="space-y-3">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setIsOpen(false)} className="block text-sm text-slate-700">
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
