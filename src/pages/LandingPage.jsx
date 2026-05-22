import { Link } from 'react-router-dom';
import {
  FaHouse,
  FaShieldHeart,
  FaUsers,
  FaWrench,
  FaChartLine,
  FaHandshake,
  FaKey,
  FaMagnifyingGlass,
  FaClipboardCheck,
  FaMessage,
  FaQuoteLeft
} from 'react-icons/fa6';
import Button from '../components/Button';
import PropertyCard from '../components/PropertyCard';
import LandlordCard from '../components/LandlordCard';
import BenefitCard from '../components/BenefitCard';
import { landlords, properties, testimonials } from '../data/mockData';

function LandingPage() {
  const featuredProperties = properties.slice(0, 3);
  const topLandlords = [...landlords].sort((a, b) => b.rating - a.rating).slice(0, 3);
  const landlordBenefits = [
    {
      icon: FaChartLine,
      title: 'Increase Occupancy Faster',
      description: 'Trusted ratings elevate your listings and attract serious, long-term tenants.',
      tone: 'blue'
    },
    {
      icon: FaHandshake,
      title: 'Build Tenant Confidence',
      description: 'Public reviews and transparent communication history reduce renter hesitation.',
      tone: 'green'
    },
    {
      icon: FaKey,
      title: 'Run Better Properties',
      description: 'Feedback highlights maintenance gaps so you can improve retention and reputation.',
      tone: 'indigo'
    }
  ];
  const tenantBenefits = [
    {
      icon: FaMagnifyingGlass,
      title: 'Compare Before You Commit',
      description: 'Evaluate property condition, response speed, and landlord professionalism upfront.',
      tone: 'indigo'
    },
    {
      icon: FaClipboardCheck,
      title: 'Choose Safer Rentals',
      description: 'Verified ratings and review patterns help avoid poor housing experiences.',
      tone: 'blue'
    },
    {
      icon: FaMessage,
      title: 'Rent With Clarity',
      description: 'Understand maintenance quality and communication standards before move-in.',
      tone: 'green'
    }
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-500 py-20 text-white">
        <div className="hero-orb absolute -left-12 top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
        <div className="hero-orb absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div className="container-app relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">Trusted Rental Transparency</p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Find better homes and trusted landlords with RentRate
            </h1>
            <p className="mt-4 max-w-xl text-sm text-blue-50 sm:text-base">
              RentRate helps tenants discover quality rentals and gives great landlords the visibility they deserve through honest reviews.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/properties">
                <Button variant="secondary" size="lg">
                  Find a Property
                </Button>
              </Link>
              <Link to="/add-property">
                <Button variant="outline" size="lg" className="border-white/60 bg-white/10 text-white hover:bg-white/20">
                  List Your Property
                </Button>
              </Link>
            </div>
          </div>
          <div className="card bg-white/95 p-6 text-slate-900">
            <h3 className="text-xl font-bold">How RentRate Works</h3>
            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <p className="flex items-start gap-2">
                <FaHouse className="mt-1 text-brand-600" /> Landlords create listings and onboard tenants.
              </p>
              <p className="flex items-start gap-2">
                <FaUsers className="mt-1 text-brand-600" /> Tenants browse verified listings and compare ratings.
              </p>
              <p className="flex items-start gap-2">
                <FaShieldHeart className="mt-1 text-brand-600" /> Reviews create transparency around maintenance and communication.
              </p>
              <p className="flex items-start gap-2">
                <FaWrench className="mt-1 text-brand-600" /> Better ratings reward proactive property care.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-app py-16">
        <h2 className="section-title">Why Landlords Choose RentRate</h2>
        <p className="section-subtitle">Purpose-built tools to turn property quality into tenant trust.</p>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {landlordBenefits.map((item, index) => (
            <div key={item.title} className="animate-fade-up" style={{ animationDelay: `${index * 120}ms` }}>
              <BenefitCard icon={item.icon} title={item.title} description={item.description} tone={item.tone} />
            </div>
          ))}
        </div>
      </section>

      <section className="container-app pb-16">
        <h2 className="section-title">Why Tenants Trust RentRate</h2>
        <p className="section-subtitle">More than listings. Get social proof before signing any lease.</p>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {tenantBenefits.map((item, index) => (
            <div key={item.title} className="animate-fade-up" style={{ animationDelay: `${index * 120}ms` }}>
              <BenefitCard icon={item.icon} title={item.title} description={item.description} tone={item.tone} />
            </div>
          ))}
        </div>
      </section>

      <section className="container-app pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="section-title">Featured Properties</h2>
          <Link to="/properties" className="text-sm font-semibold text-brand-700 hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredProperties.map((property) => {
            const landlord = landlords.find((item) => item.id === property.landlordId);
            return <PropertyCard key={property.id} property={property} landlord={landlord} />;
          })}
        </div>
      </section>

      <section className="container-app pb-16">
        <h2 className="section-title">Top-Rated Landlords</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {topLandlords.map((landlord) => (
            <LandlordCard key={landlord.id} landlord={landlord} />
          ))}
        </div>
      </section>

      <section className="container-app pb-10">
        <h2 className="section-title">What Users Say</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <article
              key={item.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.13)]"
            >
              <FaQuoteLeft className="absolute -right-3 top-3 text-7xl text-brand-100 transition duration-300 group-hover:scale-105 group-hover:text-brand-200" />
              <div
                className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.role}
              </div>
              <p className="relative text-sm leading-7 text-slate-700">“{item.text}”</p>
              <p className="mt-5 text-sm font-bold text-slate-900">{item.name}</p>
              <div className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-300 group-hover:w-24" />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
