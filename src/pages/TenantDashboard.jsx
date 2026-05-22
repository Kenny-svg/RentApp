import { Link } from 'react-router-dom';
import { FaClock, FaHeart, FaMessage, FaRegStar } from 'react-icons/fa6';
import DashboardCard from '../components/DashboardCard';
import PropertyCard from '../components/PropertyCard';
import { landlords, properties } from '../data/mockData';

function TenantDashboard() {
  const savedProperties = properties.slice(0, 2);
  const recommendedProperties = properties.slice(1, 4);

  return (
    <section className="container-app py-10">
      <h1 className="text-3xl font-bold text-slate-900">Tenant Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">Track saved homes and manage landlord interactions.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Saved Properties" value="7" icon={FaHeart} accent="text-rose-500" />
        <DashboardCard label="Recently Viewed" value="12" icon={FaClock} />
        <DashboardCard label="Landlords Contacted" value="4" icon={FaMessage} accent="text-accent-600" />
        <DashboardCard label="Reviews Submitted" value="5" icon={FaRegStar} accent="text-amber-500" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Saved Properties</h2>
            <Link to="/properties" className="text-sm font-semibold text-brand-700 hover:underline">
              Browse more
            </Link>
          </div>
          <div className="space-y-4">
            {savedProperties.map((property) => {
              const landlord = landlords.find((item) => item.id === property.landlordId);
              return <PropertyCard key={property.id} property={property} landlord={landlord} />;
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Recommended Properties</h2>
          <div className="space-y-4">
            {recommendedProperties.map((property) => {
              const landlord = landlords.find((item) => item.id === property.landlordId);
              return <PropertyCard key={property.id} property={property} landlord={landlord} />;
            })}
          </div>
        </section>
      </div>

      <section className="mt-8 card p-5">
        <h2 className="text-xl font-bold text-slate-900">Profile Section</h2>
        <p className="mt-2 text-sm text-slate-700">
          Name: Daniel Lee | Preferred Location: Austin, TX | Budget: $2,000 - $2,500 | Lease Type: 12 months
        </p>
      </section>
    </section>
  );
}

export default TenantDashboard;
