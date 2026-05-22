import { useParams } from 'react-router-dom';
import ContactForm from '../components/ContactForm';
import { properties } from '../data/mockData';

function ContactLandlordPage() {
  const { propertyId } = useParams();
  const property = properties.find((item) => item.id === propertyId) || properties[0];

  return (
    <section className="container-app py-10">
      <div className="mx-auto max-w-2xl card p-5 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900">Contact Landlord</h1>
        <p className="mt-1 text-sm text-slate-600">Send a message about {property.title}.</p>
        <div className="mt-5">
          <ContactForm propertyTitle={property.title} />
        </div>
      </div>
    </section>
  );
}

export default ContactLandlordPage;
