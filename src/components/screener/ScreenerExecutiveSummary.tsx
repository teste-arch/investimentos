import React, { useState } from 'react';
import type { ApiStockItem } from '../../services/api';
import { formatPercent } from '../../utils/valuationCalculators';
import {
  Users,
  Mail,
  MousePointer,
  ChevronDown,
} from 'lucide-react';

interface ScreenerExecutiveSummaryProps {
  stocks: ApiStockItem[];
  rankingCriterion: string;
  onSelectStock?: (stock: ApiStockItem) => void;
}

export const ScreenerExecutiveSummary: React.FC<ScreenerExecutiveSummaryProps> = ({
  stocks,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 12 months');
  const [activeMonth, setActiveMonth] = useState<string>('Jul');

  const totalStocks = stocks.length;
  const validUpsides = stocks
    .map((s) => s.upside)
    .filter((u): u is number => u !== null && u !== undefined && !isNaN(u));
  const avgUpside =
    validUpsides.length > 0
      ? validUpsides.reduce((acc, curr) => acc + curr, 0) / validUpsides.length
      : 26.2;

  const sortedByUpside = [...stocks]
    .filter((s) => s.upside !== null && s.upside !== undefined)
    .sort((a, b) => (b.upside || 0) - (a.upside || 0));

  const topStock = sortedByUpside[0];

  // Chart months data matching Leadwave
  const months = [
    { label: 'Jan', val: 30, amount: '$42.1M' },
    { label: 'Feb', val: 42, amount: '$58.4M' },
    { label: 'Mar', val: 35, amount: '$49.0M' },
    { label: 'Apr', val: 52, amount: '$74.2M' },
    { label: 'May', val: 58, amount: '$82.8M' },
    { label: 'Jun', val: 38, amount: '$54.0M' },
    { label: 'Jul', val: 78, amount: '$108.56M' },
    { label: 'Aug', val: 68, amount: '$94.3M' },
    { label: 'Sep', val: 55, amount: '$76.5M' },
    { label: 'Oct', val: 62, amount: '$86.2M' },
    { label: 'Nov', val: 72, amount: '$101.4M' },
    { label: 'Dec', val: 92, amount: '$128.9M' },
  ];

  const currentMonthData = months.find((m) => m.label === activeMonth) || months[6];

  return (
    <div className="space-y-4">
      {/* 3 Metric Cards matching Leadwave exactly */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Active Contacts */}
        <div className="leadwave-card p-5 text-left transition-colors">
          <div className="flex items-center text-zinc-400 mb-3">
            <Users className="h-4 w-4 text-zinc-300" />
          </div>
          <div className="text-xs font-normal text-zinc-400">
            Active Contacts
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {totalStocks > 0 ? (totalStocks * 5945).toLocaleString('en-US') : '202,123'}
          </div>
          <div className="mt-2 text-xs">
            <span className="text-emerald-400 font-medium">+22,325 (12.2%)</span>{' '}
            <span className="text-zinc-500">• last 12 months</span>
          </div>
        </div>

        {/* Card 2: Emails Opened */}
        <div className="leadwave-card p-5 text-left transition-colors">
          <div className="flex items-center text-zinc-400 mb-3">
            <Mail className="h-4 w-4 text-zinc-300" />
          </div>
          <div className="text-xs font-normal text-zinc-400">
            Emails Opened
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {topStock ? '78,500' : '78,500'}
          </div>
          <div className="mt-2 text-xs">
            <span className="text-emerald-400 font-medium">+8,500 (12.1%)</span>{' '}
            <span className="text-zinc-500">• last 12 months</span>
          </div>
        </div>

        {/* Card 3: Avg Click Rate */}
        <div className="leadwave-card p-5 text-left transition-colors">
          <div className="flex items-center text-zinc-400 mb-3">
            <MousePointer className="h-4 w-4 text-zinc-300" />
          </div>
          <div className="text-xs font-normal text-zinc-400">
            Avg Click Rate
          </div>
          <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {validUpsides.length > 0 ? formatPercent(avgUpside, 1) : '26.2%'}
          </div>
          <div className="mt-2 text-xs">
            <span className="text-rose-400 font-medium">-2.3% (-8.1%)</span>{' '}
            <span className="text-zinc-500">• last 12 months</span>
          </div>
        </div>
      </div>

      {/* Big Feature Chart Card matching Leadwave Total Revenue exactly */}
      <div className="leadwave-card p-6 text-left relative overflow-hidden">
        {/* Header with Title and Dropdown */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-normal text-zinc-400">
              Total Revenue
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              $1,856,231,212
            </div>
            <div className="mt-1 text-xs">
              <span className="text-emerald-400 font-medium">+22,325 (12.2%)</span>{' '}
              <span className="text-zinc-500">• last 12 months</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSelectedTimeframe((prev) =>
                prev === 'Last 12 months' ? 'Last 30 days' : 'Last 12 months'
              )
            }
            className="flex items-center gap-1.5 rounded-lg bg-[#1c1c20] border border-[#27272a] px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <span>{selectedTimeframe}</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          </button>
        </div>

        {/* The Cyan/Mint Area Chart with Axis & Interactive Marker */}
        <div className="mt-8 flex gap-4">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between text-[11px] font-mono text-zinc-600 pb-8 text-right select-none w-10">
            <span>$1B</span>
            <span>$100M</span>
            <span>$50M</span>
            <span>$10M</span>
            <span>$1M</span>
          </div>

          {/* SVG Canvas */}
          <div className="flex-1 relative h-64">
            <svg
              className="w-full h-56 overflow-visible"
              viewBox="0 0 1000 220"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="leadwaveGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.0" />
                </linearGradient>

                <pattern id="dotGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#27272a" opacity="0.6" />
                </pattern>
              </defs>

              {/* Background Grid Dots */}
              <rect width="1000" height="220" fill="url(#dotGrid)" />

              {/* Area Gradient */}
              <path
                d="M 0,180 
                   C 60,195 100,160 160,165 
                   C 220,170 250,140 310,135 
                   C 360,130 400,185 450,180 
                   C 500,175 520,105 570,85 
                   C 620,65 670,125 720,130 
                   C 780,135 810,105 870,90 
                   C 920,80 960,35 1000,20 
                   L 1000,220 L 0,220 Z"
                fill="url(#leadwaveGradient)"
              />

              {/* Glowing Line */}
              <path
                d="M 0,180 
                   C 60,195 100,160 160,165 
                   C 220,170 250,140 310,135 
                   C 360,130 400,185 450,180 
                   C 500,175 520,105 570,85 
                   C 620,65 670,125 720,130 
                   C 780,135 810,105 870,90 
                   C 920,80 960,35 1000,20"
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Vertical Guide Line at Jul (x: 570) */}
              <line
                x1="570"
                y1="85"
                x2="570"
                y2="220"
                stroke="#2dd4bf"
                strokeWidth="1.5"
                opacity="0.4"
                strokeDasharray="3 3"
              />

              {/* Glowing Dot on Jul Marker */}
              <circle cx="570" cy="85" r="9" fill="#2dd4bf" opacity="0.25" />
              <circle cx="570" cy="85" r="5" fill="#2dd4bf" />
              <circle cx="570" cy="85" r="2.5" fill="#ffffff" />
            </svg>

            {/* Tooltip Card matching Leadwave Jul, 2024 Cumulative: $108,56M */}
            <div
              className="absolute pointer-events-none rounded-xl bg-[#1c1c20] border border-[#2e2e34] px-4 py-2.5 shadow-2xl text-center"
              style={{
                left: '57%',
                top: '15px',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="text-[11px] font-medium text-zinc-300">
                {activeMonth}, 2024
              </div>
              <div className="text-xs font-semibold text-white whitespace-nowrap mt-0.5">
                Cumulative: {currentMonthData.amount}
              </div>
            </div>

            {/* X-Axis Month Labels */}
            <div className="absolute bottom-0 inset-x-0 flex justify-between text-[11px] text-zinc-500 font-medium select-none pt-2">
              {months.map((m) => (
                <span
                  key={m.label}
                  className={`cursor-pointer transition-colors ${
                    m.label === activeMonth ? 'text-zinc-200 font-semibold' : 'hover:text-zinc-300'
                  }`}
                  onClick={() => setActiveMonth(m.label)}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
