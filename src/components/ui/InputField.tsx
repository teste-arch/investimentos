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
        className="text-[11px] font-bold uppercase tracking-wider text-zinc-300"
      >
        {label}
      </label>
      <div className="relative rounded-xl shadow-xs">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-xs font-semibold text-zinc-400">{prefix}</span>
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
          className={`block w-full rounded-xl border border-white/[0.08] bg-[#12141d] py-2 text-sm font-semibold text-white transition-colors focus:border-white/30 focus:outline-hidden focus:ring-1 focus:ring-white/20 ${
            prefix ? 'pl-9' : 'pl-3'
          } ${suffix ? 'pr-9' : 'pr-3'} ${
            disabled ? 'cursor-not-allowed opacity-50 bg-white/[0.02]' : ''
          }`}
        />
        {suffix && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-xs font-semibold text-zinc-400">{suffix}</span>
          </div>
        )}
      </div>
      {helpText && (
        <p className="text-[10px] text-zinc-400 leading-tight">{helpText}</p>
      )}
    </div>
  );
};
