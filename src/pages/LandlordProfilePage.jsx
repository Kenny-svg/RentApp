import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/Button';
import LandlordCard from '../components/LandlordCard';
import PropertyCard from '../components/PropertyCard';
import ReviewCard from '../components/ReviewCard';
import { landlords, properties, reviews } from '../data/mockData';

function LandlordProfilePage() {
  const { landlordId } = useParams();
  const landlord = landlords.find((item) => item.id === landlordId) || landlords[0];

  const ownedProperties = useMemo(
    () => properties.filter((property) => property.landlordId === landlord.id),
    [landlord.id]
  );

  const landlordReviews = useMemo(
    () => reviews.filter((review) => review.landlordId === landlord.id),
    [landlord.id]
  );

  return (
    <section className="container-app py-10">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <h1 className="text-3xl font-bold text-slate-900">{landlord.name}</h1>
            <p className="mt-3 text-sm text-slate-700">{landlord.bio}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              <p>Average Rating: {landlord.rating}</p>
              <p>Properties Listed: {landlord.propertiesCount}</p>
              <p>Tenant Reviews: {landlord.reviewsCount}</p>
            </div>
            <Button className="mt-5">Contact Landlord</Button>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Properties Owned</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {ownedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} landlord={landlord} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900">Tenant Reviews and Comments</h2>
            <div className="space-y-3">
              {landlordReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </section>
        </div>

        <aside>
          <LandlordCard landlord={landlord} />
        </aside>
      </div>
    </section>
  );
}

export default LandlordProfilePage;
