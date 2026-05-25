import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import InputField from './InputField';
import SelectField from './SelectField';
import TextareaField from './TextareaField';
import { useAuth } from '../hooks/useAuth';
import {
  checkTenantReviewEligibility,
  createLandlordReview,
  createPropertyReview
} from '../services/reviewService';

const initialValues = {
  tenantName: '',
  landlordRating: '',
  propertyRating: '',
  maintenanceQuality: '',
  communication: '',
  propertyCondition: '',
  rentFairness: '',
  comment: '',
  recommend: ''
};

const ratingOptions = [
  { label: 'Select', value: '' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' }
];

function ReviewForm({ propertyId = '', landlordId = '', onSuccess }) {
  const { isAuthenticated, user, profile } = useAuth();
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tenantDisplayName = useMemo(
    () => profile?.full_name || user?.name || '',
    [profile?.full_name, user?.name]
  );

  useEffect(() => {
    if (!tenantDisplayName) return;
    setForm((prev) => ({ ...prev, tenantName: tenantDisplayName }));
  }, [tenantDisplayName]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!form.landlordRating) nextErrors.landlordRating = 'Required';
    if (!form.propertyRating) nextErrors.propertyRating = 'Required';
    if (!form.maintenanceQuality) nextErrors.maintenanceQuality = 'Required';
    if (!form.communication) nextErrors.communication = 'Required';
    if (!form.propertyCondition) nextErrors.propertyCondition = 'Required';
    if (!form.rentFairness) nextErrors.rentFairness = 'Required';
    if (!form.comment.trim()) nextErrors.comment = 'Required';
    if (!form.recommend) nextErrors.recommend = 'Required';

    if (!propertyId || !landlordId) {
      nextErrors.form = 'Property context is missing. Open a property details page to submit a review.';
    }

    if (!isAuthenticated) {
      nextErrors.form = 'Please login as a tenant to leave a review.';
    } else if (user?.role !== 'tenant') {
      nextErrors.form = 'Only tenant accounts can submit reviews.';
    }

    setErrors(nextErrors);
    setSuccess('');
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setSubmitting(true);

      const tenantName =
        form.tenantName.trim() || profile?.full_name || user?.name || 'Tenant';
      const recommendValue = form.recommend === 'yes';

      const eligibility = await checkTenantReviewEligibility({
        tenantId: user.id,
        propertyId,
        landlordId
      });
      if (!eligibility.allowed) {
        throw new Error(eligibility.reason || 'You are not eligible to review this property yet.');
      }

      await createPropertyReview({
        property_id: propertyId,
        tenant_id: user.id,
        landlord_id: landlordId,
        overall_rating: Number(form.propertyRating),
        maintenance_rating: Number(form.maintenanceQuality),
        property_condition_rating: Number(form.propertyCondition),
        rent_fairness_rating: Number(form.rentFairness),
        comment: form.comment.trim(),
        would_recommend: recommendValue
      });

      await createLandlordReview({
        property_id: propertyId,
        landlord_id: landlordId,
        tenant_id: user.id,
        overall_rating: Number(form.landlordRating),
        communication_rating: Number(form.communication),
        maintenance_response_rating: Number(form.maintenanceQuality),
        fairness_rating: Number(form.rentFairness),
        comment: form.comment.trim(),
        would_recommend: recommendValue
      });

      setSuccess(`Review submitted successfully. Thanks, ${tenantName}.`);
      setForm(initialValues);
      onSuccess?.();
    } catch (submitError) {
      setErrors({
        form:
          submitError?.message ||
          'Unable to submit review right now. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isAuthenticated ? (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Please <Link to="/login" className="font-semibold underline">login</Link> as a tenant to leave a review.
        </p>
      ) : null}
      <InputField
        label="Your name (from profile)"
        value={tenantDisplayName || form.tenantName}
        readOnly
        disabled
        className="cursor-not-allowed bg-slate-100 text-slate-500"
        error={errors.tenantName}
      />

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        This single submission creates both a landlord review and a property review.
      </div>

      <h4 className="text-sm font-bold text-slate-900">Landlord Experience</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Landlord star rating"
          value={form.landlordRating}
          onChange={(e) => update('landlordRating', e.target.value)}
          options={ratingOptions}
          error={errors.landlordRating}
        />
        <SelectField
          label="Communication rating"
          value={form.communication}
          onChange={(e) => update('communication', e.target.value)}
          options={ratingOptions}
          error={errors.communication}
        />
      </div>

      <h4 className="text-sm font-bold text-slate-900">Property Experience</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Property star rating"
          value={form.propertyRating}
          onChange={(e) => update('propertyRating', e.target.value)}
          options={ratingOptions}
          error={errors.propertyRating}
        />
        <SelectField
          label="Maintenance quality"
          value={form.maintenanceQuality}
          onChange={(e) => update('maintenanceQuality', e.target.value)}
          options={ratingOptions}
          error={errors.maintenanceQuality}
        />
        <SelectField
          label="Property condition"
          value={form.propertyCondition}
          onChange={(e) => update('propertyCondition', e.target.value)}
          options={ratingOptions}
          error={errors.propertyCondition}
        />
        <SelectField
          label="Rent fairness"
          value={form.rentFairness}
          onChange={(e) => update('rentFairness', e.target.value)}
          options={ratingOptions}
          error={errors.rentFairness}
        />
      </div>

      <TextareaField
        label="Written review"
        rows={4}
        value={form.comment}
        onChange={(e) => update('comment', e.target.value)}
        error={errors.comment}
      />

      <SelectField
        label="Would you recommend this landlord/property?"
        value={form.recommend}
        onChange={(e) => update('recommend', e.target.value)}
        options={[
          { label: 'Select', value: '' },
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ]}
        error={errors.recommend}
      />

      {errors.form ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{errors.form}</p> : null}
      {success ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}
      <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}

export default ReviewForm;
