import { Link } from 'react-router-dom';
import { FaBuilding, FaStar, FaUsers, FaRegMessage } from 'react-icons/fa6';
import DashboardCard from '../components/DashboardCard';
import ReviewCard from '../components/ReviewCard';
import Button from '../components/Button';
import RatingStars from '../components/RatingStars';
import { landlords, properties, reviews } from '../data/mockData';

function LandlordDashboard() {
  const landlord = landlords[0];
  const ownedProperties = properties.filter((property) => property.landlordId === landlord.id);
  const landlordReviews = reviews.filter((review) => review.landlordId === landlord.id);

  return (
    <section className="container-app py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Landlord Dashboard</h1>
          <p className="text-sm text-slate-600">Track listing performance and tenant feedback.</p>
        </div>
        <Link to="/add-property">
          <Button>Add New Property</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Total Properties" value={ownedProperties.length} icon={FaBuilding} />
        <DashboardCard label="Total Tenants" value="18" icon={FaUsers} accent="text-accent-600" />
        <DashboardCard label="Average Rating" value={landlord.rating} icon={FaStar} />
        <DashboardCard label="Total Reviews" value={landlordReviews.length} icon={FaRegMessage} accent="text-amber-500" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">Property Management</h2>
          <div className="mt-4 space-y-3">
            {ownedProperties.map((property) => (
              <article key={property.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{property.title}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {property.availability}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{property.location}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-bold text-slate-900">Profile Rating Summary</h2>
          <div className="mt-4">
            <RatingStars rating={landlord.rating} />
            <p className="mt-2 text-sm text-slate-600">Based on {landlord.reviewsCount} tenant reviews.</p>
          </div>
          <div className="mt-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
            Keep response time under 24 hours and resolve requests quickly to boost profile visibility.
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-lg font-bold text-slate-900">Tenant Onboarding</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>1. Verify tenant identity and lease terms.</li>
            <li>2. Share move-in checklist and utility setup guide.</li>
            <li>3. Confirm maintenance request contact channel.</li>
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-bold text-slate-900">Recent Reviews</h2>
          <div className="mt-4 space-y-3">
            {landlordReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export default LandlordDashboard;
