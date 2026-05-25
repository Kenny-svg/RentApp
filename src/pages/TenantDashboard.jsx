import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaHeart, FaMessage, FaRegStar } from 'react-icons/fa6';
import DashboardCard from '../components/DashboardCard';
import PropertyCard from '../components/PropertyCard';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { useAuth } from '../hooks/useAuth';
import { getProperties, getSavedProperties } from '../services/propertyService';
import { getLandlordReviews, getTenantReviewQueue } from '../services/reviewService';
import { ensureTenantLinkRequest, getTenantLinkRequests } from '../services/tenantLinkService';

const fallbackImage =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';

const toCardProperty = (item) => ({
  id: item.id,
  title: item.title,
  location: item.location,
  price: Number(item.rent_price ?? 0),
  type: item.property_type || 'Apartment',
  bedrooms: item.bedrooms ?? 0,
  bathrooms: item.bathrooms ?? 0,
  landlordId: item.landlord_id,
  propertyRating: Number(item.average_rating ?? 0),
  availability:
    item.availability_status?.charAt(0).toUpperCase() + item.availability_status?.slice(1) || 'Available',
  image:
    item.property_images?.find((image) => image.is_cover)?.image_url ||
    item.property_images?.[0]?.image_url ||
    fallbackImage
});

const toCardLandlord = (item) => ({
  id: item.landlord_id,
  name: item.landlord_profile?.full_name || 'Landlord',
  rating: Number(item.landlord_profile?.average_rating || 0)
});

function TenantDashboard() {
  const { user, profile } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [linkRequests, setLinkRequests] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [landlordEmailInput, setLandlordEmailInput] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const submittedReviewsCount = reviewQueue.filter((item) => item.has_reviewed).length;

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError('');

        const [savedRows, recommendedRows, linkRequestRows, reviewQueueRows] = await Promise.all([
          getSavedProperties(user.id),
          getProperties(),
          getTenantLinkRequests(user.id),
          getTenantReviewQueue(user.id)
        ]);

        const saved = (savedRows || []).map((row) => row.properties).filter(Boolean);

        const recommended = (recommendedRows || [])
          .filter((property) => !saved.some((savedItem) => savedItem.id === property.id))
          .slice(0, 3);

        // enrich landlord rating using landlord reviews aggregate-like fallback
        const landlordIds = [...new Set([...saved, ...recommended].map((item) => item.landlord_id).filter(Boolean))];
        const ratingMap = new Map();

        await Promise.all(
          landlordIds.map(async (landlordId) => {
            try {
              const reviews = await getLandlordReviews(landlordId);
              const avg =
                reviews.length > 0
                  ? reviews.reduce((sum, review) => sum + Number(review.overall_rating || 0), 0) / reviews.length
                  : 0;
              ratingMap.set(landlordId, Number(avg.toFixed(1)));
            } catch {
              ratingMap.set(landlordId, 0);
            }
          })
        );

        const attachRating = (items) =>
          items.map((item) => ({
            ...item,
            landlord_profile: {
              ...(item.landlord_profile || {}),
              average_rating: ratingMap.get(item.landlord_id) || 0
            }
          }));

        setSavedProperties(attachRating(saved));
        setRecommendedProperties(attachRating(recommended));
        setLinkRequests(linkRequestRows || []);
        setReviewQueue(reviewQueueRows || []);
      } catch (loadError) {
        setError(loadError?.message || 'Unable to load tenant dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.id]);

  const refreshLinkRequests = async () => {
    if (!user?.id) return;
    const rows = await getTenantLinkRequests(user.id);
    setLinkRequests(rows || []);
  };

  const handleSubmitLinkRequest = async (event) => {
    event.preventDefault();
    if (requestSubmitting) return;

    if (!landlordEmailInput.trim()) {
      setRequestError('Landlord email is required.');
      setRequestMessage('');
      return;
    }

    try {
      setRequestSubmitting(true);
      setRequestError('');
      setRequestMessage('');

      await ensureTenantLinkRequest({
        tenantId: user.id,
        tenantName: profile?.full_name || user?.name || 'Tenant',
        tenantEmail: profile?.email || user?.email || '',
        landlordEmail: landlordEmailInput
      });

      setRequestMessage('Landlord link request submitted.');
      setLandlordEmailInput('');
      await refreshLinkRequests();
    } catch (submitError) {
      setRequestError(submitError?.message || 'Unable to submit landlord link request.');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const savedCards = useMemo(
    () =>
      savedProperties.map((property) => ({
        property: toCardProperty(property),
        landlord: toCardLandlord(property)
      })),
    [savedProperties]
  );

  const recommendedCards = useMemo(
    () =>
      recommendedProperties.map((property) => ({
        property: toCardProperty(property),
        landlord: toCardLandlord(property)
      })),
    [recommendedProperties]
  );

  return (
    <section className="container-app py-10">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_34px_rgba(15,23,42,0.09)] sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-200/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-emerald-200/50 blur-2xl" />
        <h1 className="relative text-3xl font-bold text-slate-900">Tenant Dashboard</h1>
        <p className="relative mt-1 text-sm text-slate-600">
          Track saved homes, manage landlord connections, and discover recommended properties.
        </p>
      </div>

      {error ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {loading ? <p className="mt-4 text-sm text-slate-600">Loading dashboard...</p> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Saved Properties" value={savedCards.length} icon={FaHeart} accent="text-rose-500" />
        <DashboardCard label="Recently Viewed" value="-" icon={FaClock} />
        <DashboardCard label="Landlords Contacted" value="-" icon={FaMessage} accent="text-accent-600" />
        <DashboardCard label="Reviews Submitted" value={submittedReviewsCount} icon={FaRegStar} accent="text-amber-500" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="card self-start p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Saved Properties</h2>
            <Link to="/properties" className="text-sm font-semibold text-brand-700 hover:underline">
              Browse more
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {savedCards.map(({ property, landlord }) => (
              <PropertyCard key={property.id} property={property} landlord={landlord} />
            ))}
            {!loading && savedCards.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 sm:col-span-2">No saved properties yet.</p>
            ) : null}
          </div>
        </section>

        <section className="card self-start p-5">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Recommended Properties</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendedCards.map(({ property, landlord }) => (
              <PropertyCard key={property.id} property={property} landlord={landlord} />
            ))}
            {!loading && recommendedCards.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 sm:col-span-2">No recommendations yet.</p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-1">
          <h2 className="text-xl font-bold text-slate-900">Profile Snapshot</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p>
              <span className="font-semibold text-slate-900">Name:</span> {profile?.full_name || user?.name || 'User'}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Email:</span> {profile?.email || user?.email || 'Not set'}
            </p>
            <p>
              <span className="font-semibold text-slate-900">Location:</span> {profile?.current_location || 'Not set'}
            </p>
          </div>
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900">Landlord Link Requests</h2>
          <form onSubmit={handleSubmitLinkRequest} className="mt-3 rounded-xl border border-slate-200 p-3">
            <InputField
              label="Landlord email"
              type="email"
              value={landlordEmailInput}
              onChange={(event) => setLandlordEmailInput(event.target.value)}
              placeholder="landlord@email.com"
            />
            {requestError ? <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{requestError}</p> : null}
            {requestMessage ? (
              <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{requestMessage}</p>
            ) : null}
            <Button type="submit" size="sm" className="mt-3" disabled={requestSubmitting}>
              {requestSubmitting ? 'Submitting...' : 'Request Link'}
            </Button>
          </form>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {linkRequests.map((request) => (
              <article key={request.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">Landlord: {request.landlord_email}</p>
                <p className="text-xs text-slate-600">Status: {request.status}</p>
                <p className="text-xs text-slate-500">
                  Submitted: {request.created_at ? new Date(request.created_at).toISOString().split('T')[0] : '-'}
                </p>
              </article>
            ))}
            {!loading && linkRequests.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 sm:col-span-2">No landlord link requests yet.</p>
            ) : null}
          </div>
        </section>
      </div>

      <section className="mt-8 card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Review Center</h2>
          <p className="text-xs text-slate-500">Rate landlord + property in one form</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {reviewQueue.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">{item.properties?.title || 'Property'}</p>
              <p className="text-xs text-slate-600">{item.properties?.location || 'Location unavailable'}</p>
              <p className="mt-1 text-xs text-slate-500">
                Tenancy status: {item.status}
              </p>
              <div className="mt-3">
                {item.has_reviewed ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    Reviewed
                  </span>
                ) : (
                  <Link to={`/properties/${item.property_id}?review=1`}>
                    <Button size="sm">Leave Review</Button>
                  </Link>
                )}
              </div>
            </article>
          ))}
          {!loading && reviewQueue.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 md:col-span-2 xl:col-span-3">
              No linked tenancy found for reviews yet. Ask your landlord to approve your onboarding request.
            </p>
          ) : null}
        </div>
      </section>
    </section>
  );
}

export default TenantDashboard;
