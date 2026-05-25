import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBuilding, FaStar, FaUsers, FaRegMessage } from 'react-icons/fa6';
import DashboardCard from '../components/DashboardCard';
import ReviewCard from '../components/ReviewCard';
import Button from '../components/Button';
import RatingStars from '../components/RatingStars';
import SelectField from '../components/SelectField';
import { useAuth } from '../hooks/useAuth';
import { getLandlordProperties } from '../services/propertyService';
import { getLandlordReviews } from '../services/reviewService';
import { getLandlordProfile } from '../services/profileService';
import {
  approveTenantLinkRequest,
  getLandlordTenantStats,
  getLandlordLinkRequests,
  rejectTenantLinkRequest
} from '../services/tenantLinkService';

function LandlordDashboard() {
  const { user } = useAuth();
  const [ownedProperties, setOwnedProperties] = useState([]);
  const [landlordReviews, setLandlordReviews] = useState([]);
  const [landlordProfile, setLandlordProfile] = useState(null);
  const [tenantStats, setTenantStats] = useState({
    totalTenants: 0,
    activeTenancies: 0,
    pastTenancies: 0
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedPropertyByRequest, setSelectedPropertyByRequest] = useState({});
  const [requestActionError, setRequestActionError] = useState('');
  const [requestActionSuccess, setRequestActionSuccess] = useState('');
  const [actingRequestId, setActingRequestId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError('');

        const [propertiesData, reviewsData, profileData, linkRequests, tenantStatsData] = await Promise.all([
          getLandlordProperties(user.id),
          getLandlordReviews(user.id),
          getLandlordProfile(user.id),
          getLandlordLinkRequests(user.id, 'pending', user.email || ''),
          getLandlordTenantStats(user.id)
        ]);

        setOwnedProperties(propertiesData || []);
        setLandlordReviews(reviewsData || []);
        setLandlordProfile(profileData || null);
        setTenantStats(
          tenantStatsData || {
            totalTenants: 0,
            activeTenancies: 0,
            pastTenancies: 0
          }
        );
        setPendingRequests(linkRequests || []);
        const defaultSelections = {};
        (linkRequests || []).forEach((request) => {
          defaultSelections[request.id] = '';
        });
        setSelectedPropertyByRequest(defaultSelections);
      } catch (loadError) {
        setError(loadError?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.id]);

  const mappedReviews = useMemo(
    () =>
      (landlordReviews || []).map((review) => ({
        id: review.id,
        tenantName: review.tenant_profile?.full_name || 'Tenant',
        date: review.created_at ? new Date(review.created_at).toISOString().split('T')[0] : '',
        landlordRating: Number(review.overall_rating || 0),
        propertyRating: Number(review.fairness_rating || review.overall_rating || 0),
        comment: review.comment || 'No comment provided.',
        recommend: Boolean(review.would_recommend)
      })),
    [landlordReviews]
  );

  const totalReviews = landlordReviews.length;
  const averageRating =
    totalReviews > 0
      ? Number(
          (
            landlordReviews.reduce((sum, review) => sum + Number(review.overall_rating || 0), 0) /
            totalReviews
          ).toFixed(1)
        )
      : Number(landlordProfile?.average_rating || 0);
  const totalProperties = ownedProperties.length || Number(landlordProfile?.total_properties || 0);

  const propertyOptions = [
    { label: 'Select property', value: '' },
    ...ownedProperties.map((property) => ({
      label: `${property.title} (${property.location})`,
      value: property.id
    }))
  ];

  const refreshRequests = async () => {
    if (!user?.id) return;
    const rows = await getLandlordLinkRequests(user.id, 'pending', user.email || '');
    setPendingRequests(rows || []);
    setSelectedPropertyByRequest((prev) => {
      const next = { ...prev };
      (rows || []).forEach((row) => {
        if (!(row.id in next)) next[row.id] = '';
      });
      return next;
    });
  };

  const handleApproveRequest = async (requestId) => {
    const selectedPropertyId = selectedPropertyByRequest[requestId];
    if (!selectedPropertyId) {
      setRequestActionError('Select a property before approving a tenant request.');
      setRequestActionSuccess('');
      return;
    }

    try {
      setActingRequestId(requestId);
      setRequestActionError('');
      setRequestActionSuccess('');
      await approveTenantLinkRequest({
        requestId,
        landlordId: user.id,
        propertyId: selectedPropertyId,
        landlordEmail: user.email || ''
      });
      setRequestActionSuccess('Tenant linked successfully.');
      await refreshRequests();
    } catch (actionError) {
      setRequestActionError(actionError?.message || 'Unable to approve request.');
    } finally {
      setActingRequestId('');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setActingRequestId(requestId);
      setRequestActionError('');
      setRequestActionSuccess('');
      await rejectTenantLinkRequest({
        requestId,
        landlordId: user.id,
        landlordEmail: user.email || '',
        reason: 'Request rejected by landlord.'
      });
      setRequestActionSuccess('Request rejected.');
      await refreshRequests();
    } catch (actionError) {
      setRequestActionError(actionError?.message || 'Unable to reject request.');
    } finally {
      setActingRequestId('');
    }
  };

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

      {error ? <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      {loading ? <p className="mb-4 text-sm text-slate-600">Loading dashboard...</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard label="Total Properties" value={totalProperties} icon={FaBuilding} />
        <DashboardCard label="Total Tenants" value={tenantStats.totalTenants} icon={FaUsers} accent="text-accent-600" />
        <DashboardCard label="Average Rating" value={averageRating.toFixed(1)} icon={FaStar} />
        <DashboardCard label="Total Reviews" value={totalReviews} icon={FaRegMessage} accent="text-amber-500" />
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
                    {property.availability_status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{property.location}</p>
                <div className="mt-3">
                  <Link to={`/properties/${property.id}/edit`} className="text-sm font-semibold text-brand-700 hover:underline">
                    Edit Property
                  </Link>
                </div>
              </article>
            ))}
            {!loading && ownedProperties.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">No properties listed yet.</p>
            ) : null}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-bold text-slate-900">Profile Rating Summary</h2>
          <div className="mt-4">
            <RatingStars rating={averageRating} />
            <p className="mt-2 text-sm text-slate-600">Based on {totalReviews} tenant reviews.</p>
            <p className="mt-1 text-xs text-slate-500">
              {tenantStats.activeTenancies} active tenancies · {tenantStats.pastTenancies} past tenancies
            </p>
          </div>
          <div className="mt-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
            Keep response time under 24 hours and resolve requests quickly to boost profile visibility.
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-lg font-bold text-slate-900">Tenant Onboarding Requests</h2>
          {requestActionError ? (
            <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{requestActionError}</p>
          ) : null}
          {requestActionSuccess ? (
            <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{requestActionSuccess}</p>
          ) : null}

          <div className="mt-4 space-y-3">
            {pendingRequests.map((request) => (
              <article key={request.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">
                  {request.tenant_profile?.full_name || request.tenant_name || 'Tenant'}
                </p>
                <p className="text-xs text-slate-600">
                  {request.tenant_profile?.email || request.tenant_email || 'No tenant email'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Requested landlord email: {request.landlord_email}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Requested on: {new Date(request.created_at).toISOString().split('T')[0]}
                </p>

                <div className="mt-3">
                  <SelectField
                    label="Assign property"
                    value={selectedPropertyByRequest[request.id] || ''}
                    onChange={(event) =>
                      setSelectedPropertyByRequest((prev) => ({
                        ...prev,
                        [request.id]: event.target.value
                      }))
                    }
                    options={propertyOptions}
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveRequest(request.id)}
                    disabled={actingRequestId === request.id}
                  >
                    {actingRequestId === request.id ? 'Processing...' : 'Approve & Link'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectRequest(request.id)}
                    disabled={actingRequestId === request.id}
                  >
                    Reject
                  </Button>
                </div>
              </article>
            ))}
            {!loading && pendingRequests.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">No pending onboarding requests.</p>
            ) : null}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-bold text-slate-900">Recent Reviews</h2>
          <div className="mt-4 space-y-3">
            {mappedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            {!loading && mappedReviews.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">No reviews yet.</p>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  );
}

export default LandlordDashboard;
