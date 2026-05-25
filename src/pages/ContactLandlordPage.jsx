import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import { getPropertyById } from '../services/propertyService';

function ContactLandlordPage() {
  const { propertyId } = useParams();
  const [landlordId, setLandlordId] = useState('');
  const [propertyTitle, setPropertyTitle] = useState('Property');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!propertyId) return;
      try {
        setLoading(true);
        const property = await getPropertyById(propertyId);
        setPropertyTitle(property?.title || 'Property');
        setLandlordId(property?.landlord_id || '');
      } catch {
        setPropertyTitle('Property');
        setLandlordId('');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [propertyId]);

  return (
    <section className="container-app py-10">
      <div className="mx-auto max-w-2xl card p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">Contact Landlord</h1>
        <p className="mt-1 text-sm text-slate-600">
          {loading ? 'Preparing contact form...' : `Send a message about ${propertyTitle}.`}
        </p>
        <div className="mt-5">
          <ContactForm propertyTitle={propertyTitle} propertyId={propertyId || ''} landlordId={landlordId} />
        </div>
      </div>
    </section>
  );
}

export default ContactLandlordPage;
