function SelectField({ label, options = [], error, className = '', ...props }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none ring-brand-500 transition focus:ring-2 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

export default SelectField;
