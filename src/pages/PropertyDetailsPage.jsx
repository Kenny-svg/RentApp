import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { FaPhone, FaMessage, FaLocationDot } from 'react-icons/fa6';
import Button from '../components/Button';
import RatingStars from '../components/RatingStars';
import ReviewCard from '../components/ReviewCard';
import Modal from '../components/Modal';
import ReviewForm from '../components/ReviewForm';
import ContactForm from '../components/ContactForm';
import { useModal } from '../hooks/useModal';
import { formatCurrency } from '../utils/format';
import { getPropertyById } from '../services/propertyService';
import {
  checkTenantReviewEligibility,
  getLandlordReviews,
  getPropertyReviews
} from '../services/reviewService';
import { useAuth } from '../hooks/useAuth';

const fallbackImage =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';

function PropertyDetailsPage() {
  const { propertyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const reviewModal = useModal(false);
  const contactModal = useModal(false);
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [landlordReviews, setLandlordReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewAccess, setReviewAccess] = useState({
    loading: false,
    allowed: false,
    reason: ''
  });

  const loadPropertyData = async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError('');

      const [propertyData, reviewData] = await Promise.all([getPropertyById(propertyId), getPropertyReviews(propertyId)]);
      const landlordReviewData = propertyData?.landlord_id
        ? await getLandlordReviews(propertyData.landlord_id)
        : [];

      setProperty(propertyData);
      setReviews(reviewData || []);
      setLandlordReviews(landlordReviewData || []);
    } catch (loadError) {
      setError(loadError?.message || 'Unable to load property details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropertyData();
  }, [propertyId]);

  useEffect(() => {
    const checkEligibility = async () => {
      if (!property?.id || !user?.id || user?.role !== 'tenant') {
        setReviewAccess({ loading: false, allowed: false, reason: '' });
        return;
      }

      if (user.id === property.landlord_id) {
        setReviewAccess({ loading: false, allowed: false, reason: '' });
        return;
      }

      try {
        setReviewAccess((prev) => ({ ...prev, loading: true }));
        const result = await checkTenantReviewEligibility({
          tenantId: user.id,
          propertyId: property.id,
          landlordId: property.landlord_id
        });
        setReviewAccess({
          loading: false,
          allowed: result.allowed,
          reason: result.reason || ''
        });
      } catch (eligibilityError) {
        setReviewAccess({
          loading: false,
          allowed: false,
          reason: eligibilityError?.message || 'Unable to verify review eligibility.'
        });
      }
    };

    checkEligibility();
  }, [property?.id, property?.landlord_id, user?.id, user?.role]);

  const mappedReviews = useMemo(
    () =>
      (reviews || []).map((review) => ({
        id: review.id,
        tenantName: review.tenant_profile?.full_name || 'Tenant',
        date: review.created_at ? new Date(review.created_at).toISOString().split('T')[0] : '',
        landlordRating: Number(review.overall_rating || 0),
        propertyRating: Number(review.property_condition_rating || review.overall_rating || 0),
        comment: review.comment || 'No comment provided.',
        recommend: Boolean(review.would_recommend)
      })),
    [reviews]
  );

  const propertyReviewSummary = useMemo(() => {
    const total = mappedReviews.length;
    if (total === 0) return { total: 0, average: 0 };
    const average = mappedReviews.reduce((sum, row) => sum + Number(row.propertyRating || 0), 0) / total;
    return { total, average: Number(average.toFixed(1)) };
  }, [mappedReviews]);

  const landlordRatingSummary = useMemo(() => {
    const total = (landlordReviews || []).length;
    if (total === 0) {
      return {
        rating: Number(property?.landlord_rating || 0),
        total: Number(property?.landlord_profile?.total_reviews || 0),
        topReview: null
      };
    }

    const rating =
      (landlordReviews || []).reduce((sum, row) => sum + Number(row.overall_rating || 0), 0) / total;
    const sorted = [...landlordReviews].sort((a, b) => {
      const scoreDiff = Number(b.overall_rating || 0) - Number(a.overall_rating || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    return {
      rating: Number(rating.toFixed(1)),
      total,
      topReview: sorted[0] || null
    };
  }, [landlordReviews, property?.landlord_profile?.total_reviews, property?.landlord_rating]);

  const gallery =
    property?.property_images?.map((image) => image.image_url).filter(Boolean) || [];

  const amenities = property?.property_amenities?.map((item) => item.amenity).filter(Boolean) || [];
  const isTenantViewer = user?.role === 'tenant' && user?.id !== property?.landlord_id;
  const canLeaveReview = isTenantViewer && reviewAccess.allowed;
  const canEditProperty = user?.role === 'landlord' && user?.id === property?.landlord_id;

  useEffect(() => {
    if (loading || !property?.id) return;
    const shouldOpenReview = searchParams.get('review') === '1';
    if (!shouldOpenReview) return;

    if (canLeaveReview) {
      reviewModal.open();
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('review');
    setSearchParams(nextParams, { replace: true });
  }, [canLeaveReview, loading, property?.id, reviewModal, searchParams, setSearchParams]);

  if (loading) {
    return (
      <section className="container-app py-10 text-sm text-slate-600">Loading property details...</section>
    );
  }

  if (error || !property) {
    return (
      <section className="container-app py-10">
        <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error || 'Property not found.'}</p>
      </section>
    );
  }

  return (
    <section className="container-app py-10">
      <div className="grid gap-4 sm:grid-cols-3">
        {(gallery.length > 0 ? gallery : [fallbackImage]).map((image, index) => (
          <img
            key={`${image}-${index}`}
            src={image}
            alt={`${property.title} ${index + 1}`}
            className={`h-56 w-full rounded-2xl object-cover ${index === 0 ? 'sm:col-span-2 sm:h-80' : 'sm:h-80'}`}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{property.property_type}</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{property.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <FaLocationDot className="text-brand-500" /> {property.location}
            </p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{formatCurrency(Number(property.rent_price || 0))}/mo</p>
            <p className="mt-4 text-sm text-slate-700">{property.description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {amenities.map((amenity) => (
                <span key={amenity} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {amenity}
                </span>
              ))}
              {amenities.length === 0 ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  No amenities listed
                </span>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={contactModal.open}>
                <FaPhone className="mr-2" /> Contact Landlord
              </Button>
              {canEditProperty ? (
                <Link to={`/properties/${property.id}/edit`}>
                  <Button variant="outline">Edit Property</Button>
                </Link>
              ) : null}
              {isTenantViewer && reviewAccess.loading ? (
                <Button variant="outline" disabled>
                  Checking review access...
                </Button>
              ) : null}
              {canLeaveReview ? (
                <Button variant="outline" onClick={reviewModal.open}>
                  <FaMessage className="mr-2" /> Leave a Review
                </Button>
              ) : null}
            </div>
            {canLeaveReview ? (
              <p className="mt-3 text-xs text-slate-500">
                One review submission rates both the landlord and this property.
              </p>
            ) : null}
            {isTenantViewer && !reviewAccess.loading && !reviewAccess.allowed && reviewAccess.reason ? (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">{reviewAccess.reason}</p>
            ) : null}
          </div>

          <section className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">Tenant Reviews</h2>
              <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                {propertyReviewSummary.total} reviews · {propertyReviewSummary.average.toFixed(1)} avg
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {mappedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              {mappedReviews.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 md:col-span-2">No reviews yet.</p>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="card p-5 sm:p-6">
          <p className="text-sm font-semibold text-slate-500">Landlord Profile</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{property.landlord_profile?.full_name || 'Landlord'}</h3>
          <div className="mt-2">
            <RatingStars rating={Number(landlordRatingSummary.rating || 0)} />
          </div>
          <p className="mt-1 text-xs text-slate-500">{landlordRatingSummary.total} landlord reviews</p>
          <p className="mt-3 text-sm text-slate-700">Contact the landlord for inspection and lease details.</p>
          <p className="mt-4 text-sm text-slate-600">Property Rating</p>
          <RatingStars rating={Number(propertyReviewSummary.average || property.average_rating || 0)} />
          <p className="mt-1 text-xs text-slate-500">{propertyReviewSummary.total} property reviews</p>
          {landlordRatingSummary.topReview?.comment ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
              <p className="text-xs font-semibold text-emerald-700">Top Tenant Feedback</p>
              <p className="mt-1 text-xs text-slate-700">“{landlordRatingSummary.topReview.comment}”</p>
            </div>
          ) : null}
          <p className="mt-5 text-sm text-slate-600">{property.landlord_profile?.phone || 'Phone unavailable'}</p>
          {/* <p className="text-sm text-slate-600">{property.landlord_id}</p> */}
          <Link
            to={`/landlords/${property.landlord_id}`}
            className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline"
          >
            View Public Profile
          </Link>
        </aside>
      </div>

      <Modal isOpen={contactModal.isOpen} onClose={contactModal.close} title="Contact Landlord">
        <ContactForm
          propertyTitle={property.title}
          propertyId={property.id}
          landlordId={property.landlord_id}
          onSuccess={contactModal.close}
        />
      </Modal>

      <Modal isOpen={reviewModal.isOpen} onClose={reviewModal.close} title="Leave a Review">
        <ReviewForm
          propertyId={property.id}
          landlordId={property.landlord_id}
          onSuccess={async () => {
            reviewModal.close();
            await loadPropertyData();
          }}
        />
      </Modal>
    </section>
  );
}

export default PropertyDetailsPage;
