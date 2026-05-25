import ReviewForm from '../components/ReviewForm';

function ReviewPage() {
  return (
    <section className="container-app py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900">Leave a Review</h1>
        <p className="mt-1 text-sm text-slate-600">Rate your landlord and property experience to help the next tenant.</p>
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Open a specific property details page and submit review there so it is tied to the right landlord and listing.
        </p>
        <div className="mt-6 card p-5 sm:p-6">
          <ReviewForm />
        </div>
      </div>
    </section>
  );
}

export default ReviewPage;
