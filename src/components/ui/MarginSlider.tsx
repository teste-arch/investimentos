import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface MarginSliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export const MarginSlider: React.FC<MarginSliderProps> = ({
  value,
  onChange,
  label = 'Margem de Segurança',
}) => {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 text-left space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {value >= 20 ? (
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          ) : (
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          )}
          <span className="text-xs font-semibold text-white">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={70}
            step={1}
            value={value}
            onChange={(e) => {
              const val = Math.max(0, Math.min(70, Number(e.target.value) || 0));
              onChange(val);
            }}
            className="w-14 rounded-lg border border-white/10 bg-[#12141d] px-2 py-0.5 text-right text-xs font-bold text-white focus:outline-hidden focus:border-white/30"
          />
          <span className="text-xs font-bold text-zinc-400">%</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[10px] text-zinc-400 font-mono">0%</span>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-400"
        />
        <span className="text-[10px] text-zinc-400 font-mono">50%</span>
      </div>

      <p className="text-[10px] text-zinc-400">
        Preço de Compra = Preço Teto × (1 − {value}%)
      </p>
    </div>
  );
};
