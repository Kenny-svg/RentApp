import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/Button';
import LandlordCard from '../components/LandlordCard';
import PropertyCard from '../components/PropertyCard';
import ReviewCard from '../components/ReviewCard';
import { getLandlordProperties } from '../services/propertyService';
import { getLandlordReviews, getPropertyReviewAveragesForLandlord } from '../services/reviewService';
import { getLandlordProfile, getProfile } from '../services/profileService';

const fallbackImage =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';

function LandlordProfilePage() {
  const { landlordId } = useParams();
  const [profile, setProfile] = useState(null);
  const [landlordProfile, setLandlordProfile] = useState(null);
  const [ownedProperties, setOwnedProperties] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [propertyRatingMap, setPropertyRatingMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!landlordId) return;

      try {
        setLoading(true);
        setError('');

        const [baseProfile, roleProfile, propertyRows, reviewRows, propertyRatings] = await Promise.all([
          getProfile(landlordId),
          getLandlordProfile(landlordId),
          getLandlordProperties(landlordId),
          getLandlordReviews(landlordId),
          getPropertyReviewAveragesForLandlord(landlordId)
        ]);

        setProfile(baseProfile || null);
        setLandlordProfile(roleProfile || null);
        setOwnedProperties(propertyRows || []);
        setReviews(reviewRows || []);
        setPropertyRatingMap(propertyRatings || {});
      } catch (loadError) {
        setError(loadError?.message || 'Unable to load landlord profile.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [landlordId]);

  const landlord = useMemo(
    () => {
      const reviewsCount = reviews.length;
      const computedRating =
        reviewsCount > 0
          ? reviews.reduce((sum, review) => sum + Number(review.overall_rating || 0), 0) / reviewsCount
          : Number(landlordProfile?.average_rating || 0);

      return {
        id: landlordId,
        name: profile?.full_name || 'Landlord',
        rating: Number(computedRating.toFixed(1)),
        reviewsCount: reviewsCount || Number(landlordProfile?.total_reviews || 0),
        propertiesCount: ownedProperties.length || Number(landlordProfile?.total_properties || 0),
        bio: landlordProfile?.bio || 'No bio added yet.'
      };
    },
    [landlordId, profile, landlordProfile, reviews, ownedProperties.length]
  );

  const propertyCards = useMemo(
    () =>
      ownedProperties.map((property) => ({
        id: property.id,
        title: property.title,
        location: property.location,
        price: Number(property.rent_price || 0),
        type: property.property_type || 'Apartment',
        bedrooms: property.bedrooms ?? 0,
        bathrooms: property.bathrooms ?? 0,
        landlordId,
        propertyRating: Number(propertyRatingMap[property.id]?.average || property.average_rating || 0),
        availability:
          property.availability_status?.charAt(0).toUpperCase() + property.availability_status?.slice(1) || 'Available',
        image:
          property.property_images?.find((image) => image.is_cover)?.image_url ||
          property.property_images?.[0]?.image_url ||
          fallbackImage
      })),
    [ownedProperties, landlordId, propertyRatingMap]
  );

  const reviewCards = useMemo(
    () =>
      reviews.map((review) => ({
        id: review.id,
        tenantName: review.tenant_profile?.full_name || 'Tenant',
        date: review.created_at ? new Date(review.created_at).toISOString().split('T')[0] : '',
        landlordRating: Number(review.overall_rating || 0),
        propertyRating: Number(review.fairness_rating || review.overall_rating || 0),
        comment: review.comment || 'No comment provided.',
        recommend: Boolean(review.would_recommend)
      })),
    [reviews]
  );

  const topReview = useMemo(() => {
    if (reviews.length === 0) return null;
    return [...reviews].sort((a, b) => {
      const scoreDiff = Number(b.overall_rating || 0) - Number(a.overall_rating || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    })[0];
  }, [reviews]);

  const showPropertySlider = propertyCards.length > 6;

  if (loading) {
    return <section className="container-app py-10 text-sm text-slate-600">Loading landlord profile...</section>;
  }

  if (error) {
    return (
      <section className="container-app py-10">
        <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      </section>
    );
  }

  return (
    <section className="container-app py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <h1 className="text-3xl font-bold text-slate-900">{landlord.name}</h1>
            <p className="mt-3 text-sm text-slate-700">{landlord.bio}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              <p>Average Rating: {landlord.rating.toFixed(1)}</p>
              <p>Properties Listed: {landlord.propertiesCount}</p>
              <p>Tenant Reviews: {landlord.reviewsCount}</p>
            </div>
            {topReview?.comment ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                <p className="text-xs font-semibold text-emerald-700">Top Tenant Feedback</p>
                <p className="mt-1 text-sm text-slate-700">“{topReview.comment}”</p>
              </div>
            ) : null}
            {propertyCards.length > 0 ? (
              <Link to={`/contact/${propertyCards[0].id}`} className="mt-5 inline-block">
                <Button>Contact Landlord</Button>
              </Link>
            ) : (
              <Button className="mt-5" disabled>
                Contact Landlord
              </Button>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Tenant Reviews and Comments</h2>
            <div className="space-y-3">
              {reviewCards.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              {reviewCards.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">No reviews yet.</p>
              ) : null}
            </div>
          </section>
        </div>

        <aside>
          <LandlordCard landlord={landlord} showProfileLink={false} />
        </aside>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Properties Owned</h2>
        {showPropertySlider ? (
          <div className="space-y-3">
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {propertyCards.map((property) => (
                <div key={property.id} className="w-[86vw] max-w-sm shrink-0 snap-start sm:w-80">
                  <PropertyCard property={property} landlord={landlord} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {propertyCards.map((property) => (
              <PropertyCard key={property.id} property={property} landlord={landlord} />
            ))}
          </div>
        )}
        {propertyCards.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">No properties listed.</p>
        ) : null}
      </section>
    </section>
  );
}

export default LandlordProfilePage;
