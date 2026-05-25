import { Link } from 'react-router-dom';
import { FaBed, FaBath, FaLocationDot, FaShieldHalved } from 'react-icons/fa6';
import RatingStars from './RatingStars';
import Button from './Button';
import { formatCurrency } from '../utils/format';

function PropertyCard({ property, landlord }) {
  const safeLandlord = landlord || { id: property.landlordId, name: 'Landlord', rating: 0 };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.14)]">
      <div className="relative">
        <img src={property.image} alt={property.title} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800">{property.type}</span>
          <span className="rounded-full bg-emerald-500/95 px-3 py-1 text-xs font-semibold text-white">{property.availability}</span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold leading-tight text-slate-900">{property.title}</h3>
          <div className="rounded-xl bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">Top Pick</div>
        </div>

        <p className="flex items-center gap-2 text-sm text-slate-600">
          <FaLocationDot className="text-brand-500" /> {property.location}
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
          <span className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
            <FaBed className="text-slate-500" /> {property.bedrooms} Bed
          </span>
          <span className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">
            <FaBath className="text-slate-500" /> {property.bathrooms} Bath
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xl font-extrabold text-slate-900">{formatCurrency(property.price)}<span className="text-sm font-medium text-slate-500">/mo</span></p>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Property Rating</p>
            <RatingStars rating={property.propertyRating} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <FaShieldHalved className="text-accent-600" /> Verified Landlord
              </p>
              <Link
                to={`/landlords/${safeLandlord.id}`}
                className="mt-1 block text-sm font-semibold text-brand-700 hover:underline"
              >
                {safeLandlord.name}
              </Link>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Landlord Rating</p>
              <RatingStars rating={safeLandlord.rating} />
            </div>
          </div>
        </div>

        <Link to={`/properties/${property.id}`}>
          <Button className="w-full rounded-xl mt-3">View Details</Button>
        </Link>
      </div>
    </article>
  );
}

export default PropertyCard;
