import PropertyForm from '../components/PropertyForm';

function AddPropertyPage() {
  return (
    <section className="container-app py-10">
      <h1 className="text-3xl font-bold text-slate-900">Add New Property</h1>
      <p className="mt-1 text-sm text-slate-600">Create a complete listing to attract high-quality tenants.</p>
      <div className="mt-6">
        <PropertyForm />
      </div>
    </section>
  );
}

export default AddPropertyPage;
