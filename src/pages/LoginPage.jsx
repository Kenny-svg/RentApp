import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { useAuth } from '../hooks/useAuth';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    const destination = user.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant';
    return <Navigate to={destination} replace />;
  }

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!form.password.trim()) nextErrors.password = 'Password is required';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSubmitting(true);
      const result = await login(form);

      const fromPath = location.state?.from?.pathname;
      if (fromPath) {
        navigate(fromPath, { replace: true });
        return;
      }

      const destination = result.user?.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant';
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(error?.message || 'Unable to login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-app py-16">
      <div className="mx-auto max-w-lg card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
        <p className="mt-1 text-sm text-slate-600">Login to your landlord or tenant account.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            error={errors.email}
          />
          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            error={errors.password}
          />

          {formError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p> : null}

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          No account yet?{' '}
          <Link to="/signup" className="font-semibold text-brand-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
