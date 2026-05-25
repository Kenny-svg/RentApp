import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function InputField({ label, error, className = '', type = 'text', ...props }) {
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <input
          type={resolvedType}
          className={`w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none ring-brand-500 transition focus:ring-2 ${isPassword ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-2 inline-flex items-center rounded-md px-2 text-slate-500 hover:text-slate-700"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        ) : null}
      </div>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

export default InputField;
