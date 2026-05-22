import InputField from './InputField';
import SelectField from './SelectField';

function SearchFilterBar({ filters, onChange, locations, propertyTypes }) {
  return (
    <section className="card mb-6 grid gap-4 p-4 md:grid-cols-5">
      <InputField
        label="Search"
        placeholder="Search title or landlord"
        value={filters.search}
        onChange={(e) => onChange('search', e.target.value)}
      />
      <SelectField
        label="Location"
        value={filters.location}
        onChange={(e) => onChange('location', e.target.value)}
        options={[{ label: 'All locations', value: '' }, ...locations.map((item) => ({ label: item, value: item }))]}
      />
      <SelectField
        label="Type"
        value={filters.type}
        onChange={(e) => onChange('type', e.target.value)}
        options={[{ label: 'All types', value: '' }, ...propertyTypes.map((item) => ({ label: item, value: item }))]}
      />
      <InputField
        label="Max Price"
        type="number"
        min="0"
        placeholder="Any"
        value={filters.maxPrice}
        onChange={(e) => onChange('maxPrice', e.target.value)}
      />
      <SelectField
        label="Minimum Rating"
        value={filters.rating}
        onChange={(e) => onChange('rating', e.target.value)}
        options={[
          { label: 'All ratings', value: '' },
          { label: '4.5+', value: '4.5' },
          { label: '4.0+', value: '4.0' },
          { label: '3.5+', value: '3.5' }
        ]}
      />
    </section>
  );
}

export default SearchFilterBar;
