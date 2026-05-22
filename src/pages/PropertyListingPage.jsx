import { useMemo, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import SearchFilterBar from '../components/SearchFilterBar';
import { landlords, properties } from '../data/mockData';

function PropertyListingPage() {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    maxPrice: '',
    rating: ''
  });

  const locations = [...new Set(properties.map((property) => property.location))];
  const propertyTypes = [...new Set(properties.map((property) => property.type))];

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const landlord = landlords.find((item) => item.id === property.landlordId);
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
  }, [filters]);

  const onFilterChange = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }));

  return (
    <section className="container-app py-10">
      <h1 className="text-3xl font-bold text-slate-900">Browse Rental Properties</h1>
      <p className="mt-1 text-sm text-slate-600">Search homes, compare ratings, and find trusted landlords.</p>

      <div className="mt-6">
        <SearchFilterBar
          filters={filters}
          onChange={onFilterChange}
          locations={locations}
          propertyTypes={propertyTypes}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredProperties.map((property) => {
          const landlord = landlords.find((item) => item.id === property.landlordId);
          return <PropertyCard key={property.id} property={property} landlord={landlord} />;
        })}
      </div>

      {filteredProperties.length === 0 ? (
        <p className="mt-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">No properties match your current filters.</p>
      ) : null}
    </section>
  );
}

export default PropertyListingPage;
