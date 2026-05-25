import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PropertyForm from '../components/PropertyForm';
import { useAuth } from '../hooks/useAuth';
import { getPropertyById } from '../services/propertyService';

const toFormInitialValues = (property) => ({
  title: property?.title || '',
  location: property?.location || '',
  price: String(property?.rent_price ?? ''),
  type: property?.property_type || '',
  bedrooms: String(property?.bedrooms ?? ''),
  bathrooms: String(property?.bathrooms ?? ''),
  description: property?.description || '',
  amenities: (property?.property_amenities || [])
    .map((item) => item.amenity)
    .filter(Boolean)
    .join(', '),
  availability: property?.availability_status || 'available'
});

function EditPropertyPage() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) return;

      try {
        setLoading(true);
        setError('');
        const data = await getPropertyById(propertyId);
        setProperty(data);
      } catch (loadError) {
        setError(loadError?.message || 'Unable to load this property for editing.');
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId]);

  const canEdit = useMemo(() => {
    if (!user?.id || !property?.landlord_id) return false;
    return user.id === property.landlord_id;
  }, [property?.landlord_id, user?.id]);

  if (loading) {
    return (
      <section className="container-app py-10">
        <p className="text-sm text-slate-600">Loading property editor...</p>
      </section>
    );
  }

  if (error || !property) {
    return (
      <section className="container-app py-10">
        <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error || 'Property not found.'}</p>
      </section>
    );
  }

  if (!canEdit) {
    return (
      <section className="container-app py-10">
        <div className="card max-w-2xl p-6">
          <h1 className="text-2xl font-bold text-slate-900">Property Access Restricted</h1>
          <p className="mt-2 text-sm text-slate-600">
            You can only edit properties that belong to your landlord account.
          </p>
          <Link to="/dashboard/landlord" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-app py-10">
      <h1 className="text-3xl font-bold text-slate-900">Edit Property</h1>
      <p className="mt-1 text-sm text-slate-600">Update details like description, status, pricing, and amenities.</p>

      <div className="mt-6">
        <PropertyForm mode="edit" propertyId={property.id} initialData={toFormInitialValues(property)} />
      </div>
    </section>
  );
}

export default EditPropertyPage;
