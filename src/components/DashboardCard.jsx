function DashboardCard({ label, value, icon: Icon, accent = 'text-brand-600' }) {
  return (
    <article className="card p-5">
      <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-2">
        <Icon className={`text-lg ${accent}`} />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </article>
  );
}

export default DashboardCard;
