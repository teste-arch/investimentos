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
    <div className="rounded-xl border border-slate-200 bg-white/70 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/60 text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl"
      >
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Metodologia: {title}
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Autor: {author}
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 dark:border-slate-800 space-y-3">
          <div className="rounded-lg bg-slate-100 p-2.5 font-mono text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-emerald-300">
            {formula}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};
