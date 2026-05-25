import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import InputField from './InputField';
import TextareaField from './TextareaField';
import { useAuth } from '../hooks/useAuth';
import { contactLandlord } from '../services/contactService';

const initialValues = {
  tenantName: '',
  tenantEmail: '',
  tenantPhone: '',
  property: '',
  message: ''
};

function ContactForm({ propertyTitle = '', propertyId = '', landlordId = '', onSuccess = null }) {
  const { isAuthenticated, user, profile } = useAuth();
  const [form, setForm] = useState({
    ...initialValues,
    tenantName: profile?.full_name || user?.name || '',
    tenantEmail: profile?.email || user?.email || '',
    tenantPhone: profile?.phone || '',
    property: propertyTitle
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      tenantName: prev.tenantName || profile?.full_name || user?.name || '',
      tenantEmail: prev.tenantEmail || profile?.email || user?.email || '',
      tenantPhone: prev.tenantPhone || profile?.phone || '',
      property: propertyTitle || prev.property
    }));
  }, [profile?.email, profile?.full_name, profile?.phone, propertyTitle, user?.email, user?.name]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!form.tenantName.trim()) nextErrors.tenantName = 'Required';
    if (!form.property.trim()) nextErrors.property = 'Required';
    if (!form.message.trim()) nextErrors.message = 'Required';
    if (!form.tenantEmail.trim() && !form.tenantPhone.trim()) {
      nextErrors.tenantEmail = 'Add email or phone';
      nextErrors.tenantPhone = 'Add email or phone';
    }
    if (!propertyId || !landlordId) {
      nextErrors.form = 'Property information is missing. Refresh the page and try again.';
    }
    if (!isAuthenticated) {
      nextErrors.form = 'Please login as a tenant to contact this landlord.';
    } else if (user?.role !== 'tenant') {
      nextErrors.form = 'Only tenant accounts can send landlord contact messages.';
    }

    setErrors(nextErrors);
    setSuccess('');
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSubmitting(true);

      await contactLandlord({
        property_id: propertyId,
        landlord_id: landlordId,
        tenant_id: user.id,
        tenant_name: form.tenantName.trim(),
        tenant_email: form.tenantEmail.trim() || null,
        tenant_phone: form.tenantPhone.trim() || null,
        message: form.message.trim(),
        status: 'new'
      });

      setSuccess('Message sent successfully. The landlord will contact you soon.');
      setForm((prev) => ({ ...prev, message: '' }));
      if (typeof onSuccess === 'function') onSuccess();
    } catch (submitError) {
      setErrors({ form: submitError?.message || 'Unable to send message. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isAuthenticated ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Please <Link to="/login" className="font-semibold underline">login</Link> as a tenant to contact landlords.
        </p>
      ) : null}
      <InputField
        label="Tenant name"
        value={form.tenantName}
        onChange={(e) => update('tenantName', e.target.value)}
        error={errors.tenantName}
      />
      <InputField
        label="Email"
        type="email"
        value={form.tenantEmail}
        onChange={(e) => update('tenantEmail', e.target.value)}
        error={errors.tenantEmail}
      />
      <InputField
        label="Phone"
        value={form.tenantPhone}
        onChange={(e) => update('tenantPhone', e.target.value)}
        error={errors.tenantPhone}
      />
      <InputField
        label="Property interested in"
        value={form.property}
        onChange={(e) => update('property', e.target.value)}
        error={errors.property}
      />
      <TextareaField
        label="Message"
        rows={4}
        value={form.message}
        onChange={(e) => update('message', e.target.value)}
        error={errors.message}
      />
      {errors.form ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{errors.form}</p> : null}
      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}

export default ContactForm;
