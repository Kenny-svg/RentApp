import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaPhone, FaMessage, FaLocationDot } from 'react-icons/fa6';
import Button from '../components/Button';
import RatingStars from '../components/RatingStars';
import ReviewCard from '../components/ReviewCard';
import Modal from '../components/Modal';
import ReviewForm from '../components/ReviewForm';
import ContactForm from '../components/ContactForm';
import { landlords, properties, reviews } from '../data/mockData';
import { useModal } from '../hooks/useModal';
import { formatCurrency } from '../utils/format';

function PropertyDetailsPage() {
  const { propertyId } = useParams();
  const reviewModal = useModal(false);
  const contactModal = useModal(false);

  const property = properties.find((item) => item.id === propertyId) || properties[0];
  const landlord = landlords.find((item) => item.id === property.landlordId);
  const propertyReviews = useMemo(() => reviews.filter((review) => review.propertyId === property.id), [property.id]);

  return (
    <section className="container-app py-10">
      <div className="grid gap-4 sm:grid-cols-3">
        {property.gallery.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`${property.title} ${index + 1}`}
            className={`h-56 w-full rounded-2xl object-cover ${index === 0 ? 'sm:col-span-2 sm:h-80' : 'sm:h-80'}`}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{property.type}</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{property.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <FaLocationDot className="text-brand-500" /> {property.location}
            </p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{formatCurrency(property.price)}/mo</p>
            <p className="mt-4 text-sm text-slate-700">{property.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {property.amenities.map((amenity) => (
                <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {amenity}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={contactModal.open}>
                <FaPhone className="mr-2" /> Contact Landlord
              </Button>
              <Button variant="outline" onClick={reviewModal.open}>
                <FaMessage className="mr-2" /> Leave a Review
              </Button>
            </div>
          </div>

          <section className="card p-5 sm:p-6">
            <h2 className="text-xl font-bold text-slate-900">Tenant Reviews</h2>
            <div className="mt-4 space-y-3">
              {propertyReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>
        </div>

        <aside className="card p-5 sm:p-6">
          <p className="text-sm font-semibold text-slate-500">Landlord Profile</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{landlord.name}</h3>
          <div className="mt-2">
            <RatingStars rating={landlord.rating} />
          </div>
          <p className="mt-3 text-sm text-slate-700">{landlord.bio}</p>
          <p className="mt-4 text-sm text-slate-600">Property Rating</p>
          <RatingStars rating={property.propertyRating} />
          <p className="mt-5 text-sm text-slate-600">{landlord.phone}</p>
          <p className="text-sm text-slate-600">{landlord.email}</p>
          <Link to={`/landlords/${landlord.id}`} className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
            View Public Profile
          </Link>
        </aside>
      </div>

      <Modal isOpen={contactModal.isOpen} onClose={contactModal.close} title="Contact Landlord">
        <ContactForm propertyTitle={property.title} />
      </Modal>

      <Modal isOpen={reviewModal.isOpen} onClose={reviewModal.close} title="Leave a Review">
        <ReviewForm />
      </Modal>
    </section>
  );
}

export default PropertyDetailsPage;
