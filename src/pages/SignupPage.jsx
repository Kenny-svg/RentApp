import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import InputField from '../components/InputField';
import SelectField from '../components/SelectField';
import { useAuth } from '../hooks/useAuth';

function SignupPage() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, user, loading } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'tenant',
    tenantIntent: 'searching',
    landlordEmail: ''
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    const destination = user.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant';
    return <Navigate to={destination} replace />;
  }

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!form.password.trim()) nextErrors.password = 'Password is required';
    if (form.password.trim().length > 0 && form.password.trim().length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required';
    if (form.role === 'tenant' && !form.tenantIntent) nextErrors.tenantIntent = 'Please choose one option';
    if (form.role === 'tenant' && form.tenantIntent === 'have_landlord' && !form.landlordEmail.trim()) {
      nextErrors.landlordEmail = 'Landlord email is required';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setFormError('');
    setSuccessMessage('');

    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSubmitting(true);
      const result = await signup(form);

      if (result?.needsEmailConfirmation) {
        setSuccessMessage(result.message);
        return;
      }

      navigate(form.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant', { replace: true });
    } catch (error) {
      setFormError(error?.message || 'Unable to sign up. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-app py-16">
      <div className="mx-auto max-w-xl card p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create Your RentRate Account</h1>
        <p className="mt-1 text-sm text-slate-600">Choose your account type and get started in minutes.</p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            error={errors.fullName}
          />
          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            error={errors.email}
          />
          <InputField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            error={errors.phone}
          />
          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            error={errors.password}
          />
          <SelectField
            label="Account Type"
            value={form.role}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                role: e.target.value,
                tenantIntent: e.target.value === 'tenant' ? prev.tenantIntent : 'searching',
                landlordEmail: e.target.value === 'tenant' ? prev.landlordEmail : ''
              }))
            }
            options={[
              { label: 'Tenant', value: 'tenant' },
              { label: 'Landlord', value: 'landlord' }
            ]}
          />

          {form.role === 'tenant' ? (
            <>
              <SelectField
                label="Are you joining with a landlord?"
                value={form.tenantIntent}
                onChange={(e) => setForm((prev) => ({ ...prev, tenantIntent: e.target.value }))}
                options={[
                  { label: 'I am just looking for properties', value: 'searching' },
                  { label: 'Yes, I already have a landlord', value: 'have_landlord' }
                ]}
                error={errors.tenantIntent}
              />

              {form.tenantIntent === 'have_landlord' ? (
                <InputField
                  label="Landlord email"
                  type="email"
                  value={form.landlordEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, landlordEmail: e.target.value }))}
                  error={errors.landlordEmail}
                />
              ) : null}
            </>
          ) : null}

          {formError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p> : null}
          {successMessage ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}

export default SignupPage;
