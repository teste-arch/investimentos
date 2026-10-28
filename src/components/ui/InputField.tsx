import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  value: number | string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  helpText?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 0.01,
  prefix,
  suffix,
  helpText,
  placeholder,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(isNaN(val) ? 0 : val);
  };

  return (
    <div className="flex flex-col space-y-1.5 text-left">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <div className="relative rounded-lg shadow-xs">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {prefix}
            </span>
          </div>
        )}
        <input
          type="number"
          id={id}
          value={value === 0 ? '0' : value || ''}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          className={`block w-full rounded-lg border border-slate-300 bg-white py-2 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400 ${
            prefix ? 'pl-9' : 'pl-3'
          } ${suffix ? 'pr-9' : 'pr-3'} ${
            disabled ? 'cursor-not-allowed opacity-60 bg-slate-100 dark:bg-slate-800' : ''
          }`}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {suffix}
            </span>
          </div>
        )}
      </div>
      {helpText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
          {helpText}
        </p>
      )}
    </div>
  );
};
