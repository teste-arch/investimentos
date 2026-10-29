import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface FormulaCardProps {
  title: string;
  author: string;
  formula: string;
  explanation: React.ReactNode;
  defaultOpen?: boolean;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  title,
  author,
  formula,
  explanation,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card rounded-2xl text-left overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-emerald-400">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Metodologia: {title}
            </h4>
            <span className="text-[11px] text-zinc-400">
              Autor / Referência: {author}
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-white/[0.06] p-4 space-y-3 bg-white/[0.01]">
          <div className="rounded-xl border border-white/[0.08] bg-[#0c0d14] p-3 font-mono text-xs font-semibold text-emerald-300">
            {formula}
          </div>
          <div className="text-xs text-zinc-300 leading-relaxed">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};
