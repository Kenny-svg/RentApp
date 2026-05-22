function BenefitCard({ icon: Icon, title, description, tone = 'blue' }) {
  const toneStyles = {
    blue: 'from-brand-500 to-brand-700',
    green: 'from-emerald-500 to-teal-600',
    indigo: 'from-indigo-500 to-blue-700'
  };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.13)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-slate-100/80 blur-2xl transition duration-500 group-hover:scale-125" />
      <div
        className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg ${toneStyles[tone]}`}
      >
        <Icon className="text-lg" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-300 group-hover:w-28" />
    </article>
  );
}

export default BenefitCard;
