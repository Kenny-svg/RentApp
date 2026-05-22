import { useState } from 'react';
import Button from './Button';
import InputField from './InputField';
import SelectField from './SelectField';
import TextareaField from './TextareaField';

const initialValues = {
  title: '',
  location: '',
  price: '',
  type: '',
  bedrooms: '',
  bathrooms: '',
  description: '',
  amenities: '',
  image: '',
  availability: 'Available'
};

function PropertyForm() {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      if (!value && key !== 'image') nextErrors[key] = 'This field is required';
    });
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSuccess('Property submitted successfully. This will be connected to API later.');
    setForm(initialValues);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Property title"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
        />
        <InputField
          label="Location"
          value={form.location}
          onChange={(e) => handleChange('location', e.target.value)}
          error={errors.location}
        />
        <InputField
          label="Rent price"
          type="number"
          min="0"
          value={form.price}
          onChange={(e) => handleChange('price', e.target.value)}
          error={errors.price}
        />
        <SelectField
          label="Property type"
          value={form.type}
          onChange={(e) => handleChange('type', e.target.value)}
          error={errors.type}
          options={[
            { label: 'Select type', value: '' },
            { label: 'Apartment', value: 'Apartment' },
            { label: 'House', value: 'House' },
            { label: 'Studio', value: 'Studio' },
            { label: 'Duplex', value: 'Duplex' }
          ]}
        />
        <InputField
          label="Number of bedrooms"
          type="number"
          min="0"
          value={form.bedrooms}
          onChange={(e) => handleChange('bedrooms', e.target.value)}
          error={errors.bedrooms}
        />
        <InputField
          label="Number of bathrooms"
          type="number"
          min="0"
          value={form.bathrooms}
          onChange={(e) => handleChange('bathrooms', e.target.value)}
          error={errors.bathrooms}
        />
      </div>

      <TextareaField
        label="Description"
        rows={4}
        value={form.description}
        onChange={(e) => handleChange('description', e.target.value)}
        error={errors.description}
      />

      <InputField
        label="Amenities (comma separated)"
        placeholder="Gym, Parking, Wi-Fi"
        value={form.amenities}
        onChange={(e) => handleChange('amenities', e.target.value)}
        error={errors.amenities}
      />

      <InputField
        label="Property image upload placeholder"
        placeholder="Paste image URL"
        value={form.image}
        onChange={(e) => handleChange('image', e.target.value)}
      />

      <SelectField
        label="Availability status"
        value={form.availability}
        onChange={(e) => handleChange('availability', e.target.value)}
        error={errors.availability}
        options={[
          { label: 'Available', value: 'Available' },
          { label: 'Occupied', value: 'Occupied' },
          { label: 'Coming Soon', value: 'Coming Soon' }
        ]}
      />

      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Submit Property
      </Button>
    </form>
  );
}

export default PropertyForm;
