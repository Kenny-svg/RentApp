import { useEffect, useMemo, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import SearchFilterBar from '../components/SearchFilterBar';
import { getProperties } from '../services/propertyService';

const fallbackImage =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';
const DEFAULT_LOCATIONS = ['Austin, TX', 'Seattle, WA', 'Chicago, IL', 'Denver, CO'];
const DEFAULT_PROPERTY_TYPES = ['Apartment', 'House', 'Studio', 'Duplex'];

const normalizeProperty = (item) => ({
  id: item.id,
  title: item.title,
  location: item.location,
  price: Number(item.rent_price ?? item.price ?? 0),
  type: item.property_type ?? item.type ?? 'Apartment',
  bedrooms: item.bedrooms ?? 0,
  bathrooms: item.bathrooms ?? 0,
  landlordId: item.landlord_id ?? item.landlordId,
  propertyRating: Number(item.average_rating ?? item.propertyRating ?? 0),
  availability:
    item.availability_status
      ? item.availability_status.charAt(0).toUpperCase() + item.availability_status.slice(1)
      : item.availability || 'Available',
  image:
    item.property_images?.find((image) => image.is_cover)?.image_url ||
    item.property_images?.[0]?.image_url ||
    item.image ||
    fallbackImage
});

const normalizeLandlord = (item) => ({
  id: item.landlord_id ?? item.landlordId,
  name: item.landlord_profile?.full_name ?? item.landlordName ?? 'Landlord',
  rating: Number(item.landlord_rating ?? item.landlordRating ?? 0)
});

function PropertyListingPage() {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    maxPrice: '',
    rating: ''
  });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getProperties();

        const normalized = (data ?? []).map((item) => ({
          property: normalizeProperty(item),
          landlord: normalizeLandlord(item)
        }));

        setListings(normalized);
      } catch (fetchError) {
        setError(fetchError?.message || 'Unable to load properties from Supabase.');
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const dynamicLocations = [...new Set(listings.map(({ property }) => property.location).filter(Boolean))];
  const dynamicPropertyTypes = [...new Set(listings.map(({ property }) => property.type).filter(Boolean))];
  const locations = dynamicLocations.length > 0 ? dynamicLocations : DEFAULT_LOCATIONS;
  const propertyTypes = dynamicPropertyTypes.length > 0 ? dynamicPropertyTypes : DEFAULT_PROPERTY_TYPES;

  const filteredListings = useMemo(() => {
    return listings.filter(({ property, landlord }) => {
      const searchText = `${property.title} ${landlord?.name || ''}`.toLowerCase();
      const matchesSearch = filters.search ? searchText.includes(filters.search.toLowerCase()) : true;
      const matchesLocation = filters.location ? property.location === filters.location : true;
      const matchesType = filters.type ? property.type === filters.type : true;
      const matchesPrice = filters.maxPrice ? property.price <= Number(filters.maxPrice) : true;
      const matchesRating = filters.rating
        ? property.propertyRating >= Number(filters.rating) || (landlord?.rating || 0) >= Number(filters.rating)
        : true;
      return matchesSearch && matchesLocation && matchesType && matchesPrice && matchesRating;
    });
  }, [filters, listings]);

  const onFilterChange = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));

  return (
    <section className="container-app py-10">
      <h1 className="text-3xl font-bold text-slate-900">Browse Rental Properties</h1>
      <p className="mt-1 text-sm text-slate-600">Search homes, compare ratings, and find trusted landlords.</p>

      {error ? <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700">{error}</p> : null}

      <div className="mt-6">
        <SearchFilterBar
          filters={filters}
          onChange={onFilterChange}
          locations={locations}
          propertyTypes={propertyTypes}
        />
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading properties...</p> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredListings.map(({ property, landlord }) => (
          <PropertyCard key={property.id} property={property} landlord={landlord} />
        ))}
      </div>

      {!loading && filteredListings.length === 0 ? (
        <p className="mt-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">No properties match your current filters.</p>
      ) : null}
    </section>
  );
}

export default PropertyListingPage;
