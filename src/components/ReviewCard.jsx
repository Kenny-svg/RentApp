import RatingStars from './RatingStars';

function ReviewCard({ review }) {
  return (
    <article className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-slate-900">{review.tenantName}</p>
        <span className="text-xs text-slate-500">{review.date}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
        <div>
          Landlord <RatingStars rating={review.landlordRating} showValue={false} />
        </div>
        <div>
          Property <RatingStars rating={review.propertyRating} showValue={false} />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-700">{review.comment}</p>
      <p className="mt-2 text-xs font-medium text-slate-500">Recommend: {review.recommend ? 'Yes' : 'No'}</p>
    </article>
  );
}

export default ReviewCard;
