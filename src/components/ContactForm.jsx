import { useState } from 'react';
import Button from './Button';
import InputField from './InputField';
import TextareaField from './TextareaField';

const initialValues = {
  tenantName: '',
  contact: '',
  property: '',
  message: ''
};

function ContactForm({ propertyTitle = '' }) {
  const [form, setForm] = useState({ ...initialValues, property: propertyTitle });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value) nextErrors[key] = 'Required';
    });

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSuccess('Message sent successfully. The landlord will contact you soon.');
    setForm({ ...initialValues, property: propertyTitle });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Tenant name"
        value={form.tenantName}
        onChange={(e) => update('tenantName', e.target.value)}
        error={errors.tenantName}
      />
      <InputField
        label="Email or phone"
        value={form.contact}
        onChange={(e) => update('contact', e.target.value)}
        error={errors.contact}
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
      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
      <Button type="submit">Send Message</Button>
    </form>
  );
}

export default ContactForm;
