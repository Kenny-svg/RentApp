import { FaStar, FaRegStar } from 'react-icons/fa';

function RatingStars({ rating = 0, size = 'text-sm', showValue = true }) {
  const fullStars = Math.floor(rating);

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }, (_, i) =>
          i < fullStars ? <FaStar key={i} className={size} /> : <FaRegStar key={i} className={size} />
        )}
      </div>
      {showValue ? <span className="text-xs font-semibold text-slate-600">{rating.toFixed(1)}</span> : null}
    </div>
  );
}

export default RatingStars;
