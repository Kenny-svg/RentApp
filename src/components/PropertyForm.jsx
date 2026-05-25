import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import InputField from './InputField';
import SelectField from './SelectField';
import TextareaField from './TextareaField';
import { useAuth } from '../hooks/useAuth';
import {
  createProperty,
  createPropertyAmenities,
  createPropertyImage,
  replacePropertyAmenities,
  updateProperty,
  upsertPropertyCoverImage
} from '../services/propertyService';

const defaultValues = {
  title: '',
  location: '',
  price: '',
  type: '',
  bedrooms: '',
  bathrooms: '',
  description: '',
  amenities: '',
  availability: 'available'
};

const requiredFields = ['title', 'location', 'price', 'type', 'bedrooms', 'bathrooms', 'description', 'availability'];

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Unable to read selected file.'));
        return;
      }
      const [, base64Payload = ''] = result.split(',');
      resolve(base64Payload);
    };
    reader.onerror = () => reject(new Error('Unable to read selected file.'));
    reader.readAsDataURL(file);
  });

function PropertyForm({ mode = 'create', propertyId = null, initialData = null, onSaved = null }) {
  const { user } = useAuth();
  const [form, setForm] = useState(defaultValues);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const [imagePreview, setImagePreview] = useState('');
  const isEditMode = mode === 'edit';

  useEffect(() => {
    if (initialData) {
      setForm({ ...defaultValues, ...initialData });
    } else if (!isEditMode) {
      setForm(defaultValues);
    }
  }, [initialData, isEditMode]);

  useEffect(() => {
    if (!selectedImageFile) {
      setImagePreview('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImageFile);
    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImageFile]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    requiredFields.forEach((key) => {
      if (!String(form[key] ?? '').trim()) {
        nextErrors[key] = 'This field is required';
      }
    });

    if (!isEditMode && !selectedImageFile) {
      nextErrors.imageFile = 'Property image file is required';
    }

    if (selectedImageFile && !selectedImageFile.type.startsWith('image/')) {
      nextErrors.imageFile = 'Selected file must be an image';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitLockRef.current) return;

    setSuccess('');

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    if (!user?.id || user?.role !== 'landlord') {
      setErrors({ form: 'Only authenticated landlords can manage properties.' });
      return;
    }

    if (isEditMode && !propertyId) {
      setErrors({ form: 'Property ID is missing for update.' });
      return;
    }

    try {
      submitLockRef.current = true;
      setSubmitting(true);

      const propertyPayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        address: form.location.trim(),
        rent_price: Number(form.price),
        property_type: form.type,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        availability_status: form.availability
      };

      const amenities = form.amenities
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      let resolvedPropertyId = propertyId;

      if (isEditMode) {
        await updateProperty(propertyId, propertyPayload);
        await replacePropertyAmenities(propertyId, amenities);
      } else {
        const property = await createProperty({
          ...propertyPayload,
          landlord_id: user.id
        });
        resolvedPropertyId = property.id;
        if (amenities.length > 0) {
          await createPropertyAmenities(property.id, amenities);
        }
      }

      if (selectedImageFile && resolvedPropertyId) {
        const imageBase64 = await fileToBase64(selectedImageFile);

        if (isEditMode) {
          await upsertPropertyCoverImage({
            propertyId: resolvedPropertyId,
            imageBase64,
            imageMimeType: selectedImageFile.type || 'image/jpeg',
            fileName: selectedImageFile.name,
            fileSizeBytes: selectedImageFile.size
          });
        } else {
          await createPropertyImage({
            propertyId: resolvedPropertyId,
            imageBase64,
            imageMimeType: selectedImageFile.type || 'image/jpeg',
            fileName: selectedImageFile.name,
            fileSizeBytes: selectedImageFile.size,
            isCover: true
          });
        }
      }

      setSuccess(isEditMode ? 'Property updated successfully.' : 'Property submitted successfully and image uploaded.');
      setErrors({});
      setSelectedImageFile(null);

      if (!isEditMode) {
        setForm(defaultValues);
      }

      if (typeof onSaved === 'function') {
        onSaved({ propertyId: resolvedPropertyId, mode });
      }
    } catch (submitError) {
      setErrors({ form: submitError?.message || (isEditMode ? 'Unable to update property.' : 'Unable to submit property.') });
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
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
      />

      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">
          {isEditMode ? 'Update property image (optional)' : 'Property image upload'}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setSelectedImageFile(file);
          }}
          className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
        />
        {errors.imageFile ? <span className="text-xs text-rose-600">{errors.imageFile}</span> : null}
      </label>

      {imagePreview ? (
        <img src={imagePreview} alt="Selected property" className="h-40 w-full rounded-xl object-cover sm:w-72" />
      ) : null}

      <SelectField
        label="Availability status"
        value={form.availability}
        onChange={(e) => handleChange('availability', e.target.value)}
        error={errors.availability}
        options={[
          { label: 'Available', value: 'available' },
          { label: 'Occupied', value: 'occupied' },
          { label: 'Maintenance', value: 'maintenance' }
        ]}
      />

      {errors.form ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{errors.form}</p> : null}
      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
        {submitting
          ? isEditMode
            ? 'Updating...'
            : 'Submitting...'
          : isEditMode
            ? 'Save Changes'
            : 'Submit Property'}
      </Button>
    </form>
  );
}

export default PropertyForm;
