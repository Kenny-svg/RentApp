import { useState } from 'react';
import Button from './Button';
import InputField from './InputField';
import SelectField from './SelectField';
import TextareaField from './TextareaField';

const initialValues = {
  tenantName: '',
  landlordRating: '',
  propertyRating: '',
  maintenanceQuality: '',
  communication: '',
  propertyCondition: '',
  rentFairness: '',
  comment: '',
  recommend: ''
};

const ratingOptions = [
  { label: 'Select', value: '' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' }
];

function ReviewForm({ onSuccess }) {
  const [form, setForm] = useState(initialValues);
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

    setSuccess('Review submitted successfully. Thank you for your feedback.');
    onSuccess?.();
    setForm(initialValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Your name"
        value={form.tenantName}
        onChange={(e) => update('tenantName', e.target.value)}
        error={errors.tenantName}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Landlord star rating"
          value={form.landlordRating}
          onChange={(e) => update('landlordRating', e.target.value)}
          options={ratingOptions}
          error={errors.landlordRating}
        />
        <SelectField
          label="Property star rating"
          value={form.propertyRating}
          onChange={(e) => update('propertyRating', e.target.value)}
          options={ratingOptions}
          error={errors.propertyRating}
        />
        <SelectField
          label="Maintenance quality"
          value={form.maintenanceQuality}
          onChange={(e) => update('maintenanceQuality', e.target.value)}
          options={ratingOptions}
          error={errors.maintenanceQuality}
        />
        <SelectField
          label="Communication rating"
          value={form.communication}
          onChange={(e) => update('communication', e.target.value)}
          options={ratingOptions}
          error={errors.communication}
        />
        <SelectField
          label="Property condition"
          value={form.propertyCondition}
          onChange={(e) => update('propertyCondition', e.target.value)}
          options={ratingOptions}
          error={errors.propertyCondition}
        />
        <SelectField
          label="Rent fairness"
          value={form.rentFairness}
          onChange={(e) => update('rentFairness', e.target.value)}
          options={ratingOptions}
          error={errors.rentFairness}
        />
      </div>

      <TextareaField
        label="Written review"
        rows={4}
        value={form.comment}
        onChange={(e) => update('comment', e.target.value)}
        error={errors.comment}
      />

      <SelectField
        label="Would you recommend this landlord/property?"
        value={form.recommend}
        onChange={(e) => update('recommend', e.target.value)}
        options={[
          { label: 'Select', value: '' },
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ]}
        error={errors.recommend}
      />

      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
      <Button type="submit" className="w-full sm:w-auto">
        Submit Review
      </Button>
    </form>
  );
}

export default ReviewForm;
