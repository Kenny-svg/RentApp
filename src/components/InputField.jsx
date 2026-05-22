function InputField({ label, error, className = '', ...props }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className={`w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-brand-500 transition focus:ring-2 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

export default InputField;
