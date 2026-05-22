import { Link } from 'react-router-dom';
import { FaBuilding, FaRegMessage } from 'react-icons/fa6';
import RatingStars from './RatingStars';

function LandlordCard({ landlord }) {
  return (
    <article className="card p-5">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
        {landlord.name
          .split(' ')
          .map((name) => name[0])
          .join('')
          .slice(0, 2)}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{landlord.name}</h3>
      <div className="mt-1">
        <RatingStars rating={landlord.rating} />
      </div>
      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <FaBuilding /> {landlord.propertiesCount} properties
        </p>
        <p className="flex items-center gap-2">
          <FaRegMessage /> {landlord.reviewsCount} tenant reviews
        </p>
      </div>
      <Link to={`/landlords/${landlord.id}`} className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
        View profile
      </Link>
    </article>
  );
}

export default LandlordCard;
