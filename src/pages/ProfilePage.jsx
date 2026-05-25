import { useEffect, useMemo, useState } from 'react';
import { FaBuilding, FaUser } from 'react-icons/fa';
import Button from '../components/Button';
import InputField from '../components/InputField';
import TextareaField from '../components/TextareaField';
import { useAuth } from '../hooks/useAuth';
import {
  getLandlordProfile,
  getProfile,
  getTenantProfile,
  updateProfile,
  upsertLandlordProfile,
  upsertTenantProfile
} from '../services/profileService';

const emptyForm = {
  fullName: '',
  phone: '',
  avatarUrl: '',
  bio: '',
  occupation: '',
  currentLocation: ''
};

function ProfilePage() {
  const { user, profile, refreshUserContext } = useAuth();
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(emptyForm);

  const isLandlord = user?.role === 'landlord';

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const loadProfile = async () => {
      setLoadingPage(true);
      setFormError('');

      try {
        const [baseProfile, roleProfile] = await Promise.all([
          getProfile(user.id),
          isLandlord ? getLandlordProfile(user.id) : getTenantProfile(user.id)
        ]);

        if (!mounted) return;

        setForm({
          fullName: baseProfile?.full_name || profile?.full_name || '',
          phone: baseProfile?.phone || '',
          avatarUrl: baseProfile?.avatar_url || '',
          bio: isLandlord ? roleProfile?.bio || '' : '',
          occupation: !isLandlord ? roleProfile?.occupation || '' : '',
          currentLocation: !isLandlord ? roleProfile?.current_location || '' : ''
        });
      } catch (error) {
        if (!mounted) return;
        setFormError(error?.message || 'Unable to load your profile right now.');
      } finally {
        if (mounted) setLoadingPage(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [isLandlord, profile?.full_name, user?.id]);

  const roleLabel = useMemo(() => (isLandlord ? 'Landlord' : 'Tenant'), [isLandlord]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
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
      setSaving(true);

      await updateProfile(user.id, {
        full_name: form.fullName.trim(),
        phone: form.phone.trim() || null,
        avatar_url: form.avatarUrl.trim() || null
      });

      if (isLandlord) {
        await upsertLandlordProfile(user.id, {
          bio: form.bio.trim() || null
        });
      } else {
        await upsertTenantProfile(user.id, {
          occupation: form.occupation.trim() || null,
          current_location: form.currentLocation.trim() || null
        });
      }

      await refreshUserContext();
      setSuccessMessage('Profile updated successfully.');
    } catch (error) {
      setFormError(error?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <section className="container-app py-10 sm:py-14">
        <div className="card p-6 text-sm text-slate-600 sm:p-8">Loading profile...</div>
      </section>
    );
  }

  return (
    <section className="container-app py-10 sm:py-14">
      <div className="mx-auto max-w-3xl animate-fade-up">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">My Profile</h1>
            <p className="mt-1 text-sm text-slate-600">Keep your profile up to date for better trust on RentRate.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {isLandlord ? <FaBuilding /> : <FaUser />}
            {roleLabel}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6 p-5 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Full Name" value={form.fullName} onChange={handleChange('fullName')} error={errors.fullName} />
            <InputField label="Phone" value={form.phone} onChange={handleChange('phone')} placeholder="Optional" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Email" value={profile?.email || user?.email || ''} disabled className="bg-slate-100 text-slate-500" />
            <InputField
              label="Avatar URL"
              value={form.avatarUrl}
              onChange={handleChange('avatarUrl')}
              placeholder="Optional image URL"
            />
          </div>

          {isLandlord ? (
            <TextareaField
              label="Bio"
              value={form.bio}
              onChange={handleChange('bio')}
              rows={5}
              placeholder="Tell tenants a bit about your management style, maintenance response, and expectations."
            />
          ) : (
            <>
              <p className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-700">
                All tenant profile fields are optional.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="Occupation"
                  value={form.occupation}
                  onChange={handleChange('occupation')}
                  placeholder="Optional"
                />
                <InputField
                  label="Current Location"
                  value={form.currentLocation}
                  onChange={handleChange('currentLocation')}
                  placeholder="Optional"
                />
              </div>
            </>
          )}

          {formError ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p> : null}
          {successMessage ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>
          ) : null}

          <Button type="submit" className="w-full sm:w-auto" disabled={saving}>
            {saving ? 'Saving changes...' : 'Save Profile'}
          </Button>
        </form>
      </div>
    </section>
  );
}

export default ProfilePage;
