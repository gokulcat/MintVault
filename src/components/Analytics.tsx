import React, { useState } from 'react';
import { CurrencyCode } from '../types';
import { CURRENCIES } from '../data/initialData';
import { formatCurrency } from '../utils/currency';

interface AnalyticsProps {
  currentCurrency: CurrencyCode;
  onShowToast: (msg: string, icon?: string) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  currentCurrency,
  onShowToast,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<'6m' | '1y' | '5y'>('1y');

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#3d4a42] uppercase tracking-wider font-semibold">
            <span>Portfolio Intelligence</span>
            <span>/</span>
            <span className="text-[#006948] font-bold">Autonomous Analytics ({currentCurrency})</span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Wealth Trajectory &amp; Flow Dynamics
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-[#eff4ff] rounded-xl border border-[#bccac0]/25">
            {(['6m', '1y', '5y'] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setSelectedHorizon(h);
                  onShowToast(`Adjusted projection horizon to ${h.toUpperCase()}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedHorizon === h
                    ? 'bg-white text-[#0b1c30] shadow-xs'
                    : 'text-[#3d4a42] hover:text-[#0b1c30]'
                }`}
              >
                {h.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onShowToast(`Exporting comprehensive analytics ledger in ${currentCurrency} to PDF...`, 'download')}
            className="px-4 py-2 bg-[#006948] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#00855d] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3d4a42]">Net Savings Rate</span>
            <span className="material-symbols-outlined text-[#006948] bg-[#85f8c4]/30 p-1.5 rounded-xl text-[20px]">
              percent
            </span>
          </div>
          <div className="my-3">
            <div className="font-headline text-3xl font-bold text-[#0b1c30]">24.2%</div>
            <p className="text-xs text-[#006948] font-semibold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
              +4.2% above standard 20% quota
            </p>
          </div>
          <div className="w-full bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#006948] h-full rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3d4a42]">Total Protected Net Worth</span>
            <span className="material-symbols-outlined text-[#565e74] bg-[#dae2fd]/60 p-1.5 rounded-xl text-[20px]">
              account_balance
            </span>
          </div>
          <div className="my-3">
            <div className="font-headline text-3xl font-bold text-[#0b1c30]">
              {formatCurrency(34950, currentCurrency, { showCents: false })}
            </div>
            <p className="text-xs text-[#3d4a42] mt-1">Sinking funds + Treasury HYSA</p>
          </div>
          <div className="w-full bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#565e74] h-full rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3d4a42]">Annualized Net Yield</span>
            <span className="material-symbols-outlined text-[#00855d] bg-[#85f8c4]/30 p-1.5 rounded-xl text-[20px]">
              trending_up
            </span>
          </div>
          <div className="my-3">
            <div className="font-headline text-3xl font-bold text-[#006948]">4.85% APY</div>
            <p className="text-xs text-[#3d4a42] mt-1">Compounding continuously</p>
          </div>
          <div className="w-full bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#00855d] h-full rounded-full" style={{ width: '92%' }}></div>
          </div>
        </div>

        <div className="bg-[#eff4ff] rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3d4a42]">Currency Diversification</span>
            <span className="material-symbols-outlined text-[#006948] bg-white p-1.5 rounded-xl text-[20px]">
              public
            </span>
          </div>
          <div className="my-3">
            <div className="font-headline text-2xl font-bold text-[#0b1c30]">
              {currentCurrency} / USD / EUR
            </div>
            <p className="text-xs text-[#006948] font-bold mt-1">0.05% Interbank hedge lock active</p>
          </div>
          <div className="flex gap-1 text-[11px] font-bold">
            <span className="text-[#006948]">85% Base</span> &bull; <span className="text-[#565e74]">10% JPY</span> &bull; <span className="text-[#3d4a42]">5% EUR</span>
          </div>
        </div>
      </div>

      {/* Cash Flow Visual Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Stream Flow Breakdown (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#bccac0]/25 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-lg font-bold text-[#0b1c30]">
                  Automated Cash Ingestion &amp; Split River
                </h3>
                <p className="text-xs text-[#3d4a42]">
                  Monthly {formatCurrency(6500, currentCurrency)} inbound ACH waterfall into dedicated allocations
                </p>
              </div>
              <span className="text-xs font-bold text-[#006948] bg-[#85f8c4]/30 px-3 py-1 rounded-xl">
                Zero Leakage
              </span>
            </div>

            {/* Waterfall Flow Bar */}
            <div className="flex flex-col gap-3">
              <div className="w-full h-8 rounded-xl bg-[#eff4ff] overflow-hidden flex shadow-inner">
                <div
                  className="h-full bg-[#565e74] flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ width: '44.6%' }}
                  title="Needs"
                >
                  Needs (44.6%)
                </div>
                <div
                  className="h-full bg-[#bec6e0] flex items-center justify-center text-[#0b1c30] text-[11px] font-bold"
                  style={{ width: '16.0%' }}
                  title="Wants"
                >
                  Wants (16%)
                </div>
                <div
                  className="h-full bg-[#006948] flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ width: '20.0%' }}
                  title="Wealth"
                >
                  Wealth (20%)
                </div>
                <div
                  className="h-full bg-[#85f8c4] flex items-center justify-center text-[#005137] text-[11px] font-bold"
                  style={{ width: '19.4%' }}
                  title="Safe Residual"
                >
                  Buffer (19.4%)
                </div>
              </div>

              {/* Legend with cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#eff4ff] border-l-4 border-[#565e74]">
                  <span className="text-[11px] text-[#3d4a42] font-semibold block">Fixed Needs</span>
                  <span className="font-headline text-base font-bold text-[#0b1c30]">
                    {formatCurrency(2900, currentCurrency)}
                  </span>
                  <span className="text-[10px] text-[#3d4a42]">Rent, food, transport</span>
                </div>
                <div className="p-3 rounded-xl bg-[#eff4ff] border-l-4 border-[#bec6e0]">
                  <span className="text-[11px] text-[#3d4a42] font-semibold block">Lifestyle &amp; Wants</span>
                  <span className="font-headline text-base font-bold text-[#0b1c30]">
                    {formatCurrency(1040, currentCurrency)}
                  </span>
                  <span className="text-[10px] text-[#3d4a42]">Dining, leisure, tech</span>
                </div>
                <div className="p-3 rounded-xl bg-[#eff4ff] border-l-4 border-[#006948]">
                  <span className="text-[11px] text-[#3d4a42] font-semibold block">Vaults &amp; Sinking</span>
                  <span className="font-headline text-base font-bold text-[#006948]">
                    {formatCurrency(1300, currentCurrency)}
                  </span>
                  <span className="text-[10px] text-[#3d4a42]">5 high-yield targets</span>
                </div>
                <div className="p-3 rounded-xl bg-[#eff4ff] border-l-4 border-[#85f8c4]">
                  <span className="text-[11px] text-[#3d4a42] font-semibold block">Liquid Residual</span>
                  <span className="font-headline text-base font-bold text-[#005137]">
                    {formatCurrency(1260, currentCurrency)}
                  </span>
                  <span className="text-[10px] text-[#3d4a42]">Unallocated surplus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Trajectory Graph */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-lg font-bold text-[#0b1c30]">
                  Cumulative Wealth Accumulation
                </h3>
                <p className="text-xs text-[#3d4a42]">
                  Past 6-month automated ledger vs programmed 4.85% compound target ({currentCurrency})
                </p>
              </div>
              <span className="text-xs font-semibold text-[#006948] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Audit Verified
              </span>
            </div>

            <div className="relative w-full h-52 flex flex-col justify-end pt-4">
              <svg className="w-full h-44 overflow-visible" fill="none" viewBox="0 0 500 160">
                <defs>
                  <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#006948" stopOpacity="0.25"></stop>
                    <stop offset="100%" stopColor="#006948" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>
                <line x1="0" y1="140" x2="500" y2="140" stroke="#bccac0" strokeOpacity="0.3" strokeWidth="1" />
                <line x1="0" y1="95" x2="500" y2="95" stroke="#bccac0" strokeDasharray="3 3" strokeOpacity="0.25" strokeWidth="1" />
                <line x1="0" y1="50" x2="500" y2="50" stroke="#bccac0" strokeDasharray="3 3" strokeOpacity="0.25" strokeWidth="1" />

                {/* Fill Area */}
                <path
                  d="M 20 135 Q 120 120, 200 95 T 380 40 T 480 15 L 480 140 L 20 140 Z"
                  fill="url(#areaGradient)"
                />

                {/* Target line dashed */}
                <path
                  d="M 20 135 L 480 25"
                  stroke="#565e74"
                  strokeDasharray="4 4"
                  strokeWidth="2"
                />

                {/* Actual curve */}
                <path
                  d="M 20 135 Q 120 120, 200 95 T 380 40 T 480 15"
                  stroke="#006948"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />

                {/* Points */}
                <circle cx="20" cy="135" r="4" fill="#006948" />
                <circle cx="120" cy="115" r="4" fill="#006948" />
                <circle cx="200" cy="95" r="4" fill="#006948" />
                <circle cx="300" cy="65" r="4" fill="#006948" />
                <circle cx="380" cy="40" r="4" fill="#006948" />
                <circle cx="480" cy="15" r="5" fill="#006948" stroke="#ffffff" strokeWidth="2" />
              </svg>

              <div className="flex justify-between text-xs text-[#3d4a42] pt-2 font-semibold">
                <span>May ({formatCurrency(20100, currentCurrency, { compact: true })})</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span className="text-[#006948] font-bold">Oct ({formatCurrency(34950, currentCurrency, { compact: true })})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Insights & Benchmarks (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Sinking Fund Health */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <h4 className="font-headline text-base font-bold text-[#0b1c30]">
              Vault Velocity Benchmarks
            </h4>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#0b1c30] font-semibold">Emergency Fund</span>
                  <span className="text-[#006948] font-bold">83% (Ahead 2.4 mos)</span>
                </div>
                <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#006948] h-full rounded-full" style={{ width: '83%' }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#0b1c30] font-semibold">Home Downpayment</span>
                  <span className="text-[#3d4a42] font-bold">18% (On Track)</span>
                </div>
                <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#00855d] h-full rounded-full" style={{ width: '18%' }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#0b1c30] font-semibold">Japan Vacation (JPY)</span>
                  <span className="text-[#006948] font-bold">70% (Hedged)</span>
                </div>
                <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#006948] h-full rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#0b1c30] font-semibold">Tech Upgrade</span>
                  <span className="text-[#006948] font-bold">95% (Ready)</span>
                </div>
                <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#006948] h-full rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#eff4ff] text-xs text-[#3d4a42]">
              <div className="flex items-center gap-1.5 font-bold text-[#0b1c30]">
                <span className="material-symbols-outlined text-[16px] text-[#006948]">psychology</span>
                Smart Allocation Insight
              </div>
              <p className="mt-1 text-[11px] leading-relaxed">
                By maintaining low discretionary spending (16% vs 30% cap), you are accelerating the Home Downpayment vault by an extra 14 months.
              </p>
            </div>
          </div>

          {/* FX Hedging Status */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col gap-3">
            <h4 className="font-headline text-base font-bold text-[#0b1c30]">
              Active FX Hedging Performance
            </h4>
            <div className="p-3 rounded-xl bg-[#eff4ff] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#0b1c30] block">JPY / USD Hedge</span>
                <span className="text-[11px] text-[#3d4a42]">¥470,000 locked @ 152.4</span>
              </div>
              <span className="px-2 py-1 rounded-lg bg-[#85f8c4]/40 text-[#005137] font-bold">
                +{formatCurrency(142.80, currentCurrency)} Gain
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#eff4ff] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#0b1c30] block">EUR / USD Settlement</span>
                <span className="text-[11px] text-[#3d4a42]">Guaranteed 0.05% spread</span>
              </div>
              <span className="px-2 py-1 rounded-lg bg-[#dce9ff] text-[#0b1c30] font-bold">
                Protected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
