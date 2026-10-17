import React, { useState } from 'react';
import { CurrencyCode, ExpenseCategory } from '../types';
import { CURRENCIES, INITIAL_EXPENSE_CATEGORIES } from '../data/initialData';
import { formatCurrency, getCurrencySymbol, convertAmount } from '../utils/currency';

interface BudgetBreakdownProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({
  currentCurrency,
  onCurrencyChange,
  onShowToast,
}) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>(INITIAL_EXPENSE_CATEGORIES);
  const [timePeriod, setTimePeriod] = useState<'oct' | 'sep' | 'ytd'>('oct');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [streamFilter, setStreamFilter] = useState<string>('all');
  const [showOriginalFX, setShowOriginalFX] = useState<boolean>(true);

  // Simulator State in base USD
  const defaultDiningUSD = 450;
  const [diningSimulationUSD, setDiningSimulationUSD] = useState<number>(450);
  const [ruleApplied, setRuleApplied] = useState<boolean>(false);

  // Add Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatStream, setNewCatStream] = useState<'Essential Needs' | 'Lifestyle & Wants' | 'Wealth Building'>('Essential Needs');
  const [newCatBudget, setNewCatBudget] = useState<number>(150);
  const [newCatWeight, setNewCatWeight] = useState<number>(2.5);

  const currencySymbol = getCurrencySymbol(currentCurrency);

  // Base values in USD
  const netIncomeUSD = 6500;
  const deltaMonthlyUSD = defaultDiningUSD - diningSimulationUSD;
  const annualFreedUSD = deltaMonthlyUSD * 12;

  // Compound 10 years at 7.2%
  const calculateCompoundUSD = (annualContribUSD: number, years: number = 10, rate: number = 0.072) => {
    if (annualContribUSD <= 0) return 0;
    let total = 0;
    for (let i = 0; i < years; i++) {
      total = (total + annualContribUSD) * (1 + rate);
    }
    return Math.round(total);
  };

  const compound10YrUSD = calculateCompoundUSD(annualFreedUSD);

  // Reactive amounts in USD
  const baseWantsUSD = 1040;
  const effectiveWantsUSD = baseWantsUSD - deltaMonthlyUSD;
  const baseTotalExpensesUSD = 5200;
  const effectiveTotalExpensesUSD = baseTotalExpensesUSD - deltaMonthlyUSD;
  const effectiveSafeSpendUSD = netIncomeUSD - effectiveTotalExpensesUSD;

  const handleSyncTransactions = () => {
    setIsSyncing(true);
    onShowToast(`Connecting with Chase & OpenExchange for ${currentCurrency}...`, 'sync');
    setTimeout(() => {
      setIsSyncing(false);
      onShowToast(`Ledger refreshed: 18 live transactions ingested and priced in ${currentCurrency}.`, 'check_circle');
    }, 1300);
  };

  const handleExportCSV = () => {
    onShowToast(`Exporting October 2024 tax & cash ledger in ${currentCurrency} to CSV...`, 'file_download');
    setTimeout(() => {
      onShowToast('CSV exported to your downloads folder.', 'file_download_done');
    }, 900);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const rate = CURRENCIES[currentCurrency]?.rateAgainstUSD || 1.0;
    const budgetUSD = Number(newCatBudget) / rate;

    const newCat: ExpenseCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      stream: newCatStream,
      rulePct: Number(newCatWeight) || 2.0,
      projected: budgetUSD || 150,
      actual: 0,
      icon: 'label',
    };
    setCategories([...categories, newCat]);
    onShowToast(`Added category: ${newCatName}`, 'add_circle');
    setIsCatModalOpen(false);
    setNewCatName('');
  };

  const filteredCategories = streamFilter === 'all'
    ? categories
    : categories.filter((c) => c.stream === streamFilter);

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-[#3d4a42] uppercase tracking-wider font-semibold">
            <span>Fiscal Intelligence</span>
            <span>/</span>
            <span className="text-[#006948] font-bold">Allocation &amp; Rules</span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Budget Breakdown &amp; Cash Engine
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Currency Selector Bar */}
          <div className="inline-flex items-center gap-1 p-1 bg-[#eff4ff] rounded-xl border border-[#bccac0]/25">
            <span className="text-xs uppercase text-[#3d4a42] px-2 font-bold">Currency:</span>
            {(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CHF'] as CurrencyCode[]).map((cCode) => (
              <button
                key={cCode}
                type="button"
                onClick={() => onCurrencyChange(cCode)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentCurrency === cCode
                    ? 'bg-white text-[#0b1c30] shadow-xs ring-2 ring-[#006948]/30 font-bold'
                    : 'text-[#3d4a42] hover:text-[#0b1c30]'
                }`}
              >
                {cCode} {CURRENCIES[cCode]?.symbol}
              </button>
            ))}
          </div>

          {/* Time Filter Tabs */}
          <div className="inline-flex p-1 bg-[#eff4ff] rounded-xl border border-[#bccac0]/25">
            {[
              { id: 'oct', label: 'October 2024' },
              { id: 'sep', label: 'Last Month' },
              { id: 'ytd', label: 'Year-to-Date' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTimePeriod(t.id as any);
                  onShowToast(`Displaying ledger for ${t.label}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timePeriod === t.id
                    ? 'bg-white text-[#0b1c30] shadow-xs'
                    : 'text-[#3d4a42] hover:text-[#0b1c30]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <button
            type="button"
            disabled={isSyncing}
            onClick={handleSyncTransactions}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#006948] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#00855d] transition-all cursor-pointer active:scale-[0.98]"
          >
            <span className={`material-symbols-outlined text-[18px] ${isSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isSyncing ? 'Syncing...' : 'Sync Live Transactions'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#0b1c30] rounded-xl text-xs font-bold shadow-xs border border-[#bccac0]/25 hover:bg-[#eff4ff] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#565e74]">file_download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* FX Rates Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#eff4ff] rounded-xl text-xs font-medium text-[#3d4a42] border border-[#bccac0]/25">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#006948] text-[18px]">currency_exchange</span>
          <span className="font-bold text-[#0b1c30]">Real-Time FX Rates:</span>
          <span className="font-mono">1 USD = 0.92 EUR = 0.79 GBP = 152.4 JPY = 84.1 INR = 1.39 CAD</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
          <span className="text-[#006948] font-bold">OpenExchange Sync Active ({currentCurrency})</span>
          <span>&bull; Zero markup on spot conversions</span>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3d4a42]">Total Inflow</span>
            <span className="material-symbols-outlined text-[#006948] bg-[#85f8c4]/30 p-1.5 rounded-xl text-[20px]">
              account_balance
            </span>
          </div>
          <div className="my-3">
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#0b1c30]">
              {formatCurrency(netIncomeUSD, currentCurrency)}
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-xs text-[#006948] font-semibold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>Verified direct deposit</span>
            </div>
          </div>
          <div className="w-full bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#006948] h-full rounded-full w-full"></div>
          </div>
        </div>

        {/* Total Expenses Out */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3d4a42]">Total Expenses Out</span>
            <span className="material-symbols-outlined text-[#565e74] bg-[#dae2fd]/60 p-1.5 rounded-xl text-[20px]">
              credit_card
            </span>
          </div>
          <div className="my-3">
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#0b1c30]">
              {formatCurrency(effectiveTotalExpensesUSD, currentCurrency)}
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-xs text-[#565e74] font-semibold">
              <span>{((effectiveTotalExpensesUSD / netIncomeUSD) * 100).toFixed(1)}% of monthly net income</span>
            </div>
          </div>
          <div className="w-full bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#565e74] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (effectiveTotalExpensesUSD / netIncomeUSD) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Safe-to-Spend Residual */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3d4a42]">Safe-to-Spend Residual</span>
            <span className="material-symbols-outlined text-[#00855d] bg-[#85f8c4]/30 p-1.5 rounded-xl text-[20px]">
              verified
            </span>
          </div>
          <div className="my-3">
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#006948]">
              {formatCurrency(effectiveSafeSpendUSD, currentCurrency)}
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-xs text-[#006948] font-semibold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Unallocated liquidity</span>
            </div>
          </div>
          <div className="w-full bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#00855d] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (effectiveSafeSpendUSD / netIncomeUSD) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Automation Health */}
        <div className="bg-[#eff4ff] rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3d4a42]">Automation Health</span>
            <span className="material-symbols-outlined text-[#006948] bg-white p-1.5 rounded-xl text-[20px]">
              bolt
            </span>
          </div>
          <div className="my-3">
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#0b1c30]">
              94.2%
            </div>
            <div className="inline-flex items-center gap-1 mt-1 text-xs text-[#3d4a42]">
              <span>12 active auto-rules</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#006948]">
            <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
            <span>Auto-categorization synced</span>
          </div>
        </div>
      </div>

      {/* 3 Pillar Rule Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Essential Needs */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#565e74]"></span>
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                Essential Needs (50%)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#5c647a] text-xs font-bold">
              44.6% Actual
            </span>
          </div>
          <p className="text-xs text-[#3d4a42] mb-4">
            Non-negotiable fixed overhead: shelter, critical nutrition, utilities, and transport.
          </p>
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-headline text-xl font-bold text-[#0b1c30]">
              {formatCurrency(2900, currentCurrency)}
            </span>
            <span className="text-xs text-[#3d4a42]">Cap: {formatCurrency(3250, currentCurrency)}</span>
          </div>
          <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden">
            <div className="bg-[#565e74] h-full rounded-full" style={{ width: '89.2%' }}></div>
          </div>
          <div className="flex justify-between items-center mt-3 text-xs text-[#3d4a42]">
            <span>{formatCurrency(350, currentCurrency)} Buffer Left</span>
            <span className="text-[#006948] font-bold">Optimal</span>
          </div>
        </div>

        {/* Lifestyle & Wants */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#bec6e0]"></span>
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                Lifestyle &amp; Wants (30%)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#5c647a] text-xs font-bold">
              {((effectiveWantsUSD / netIncomeUSD) * 100).toFixed(1)}% Actual
            </span>
          </div>
          <p className="text-xs text-[#3d4a42] mb-4">
            Flexible discretionary outflows: leisure, social dining, consumer goods, fitness.
          </p>
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-headline text-xl font-bold text-[#0b1c30]">
              {formatCurrency(effectiveWantsUSD, currentCurrency)}
            </span>
            <span className="text-xs text-[#3d4a42]">Cap: {formatCurrency(1950, currentCurrency)}</span>
          </div>
          <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#565e74] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (effectiveWantsUSD / 1950) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-3 text-xs text-[#3d4a42]">
            <span>{formatCurrency(Math.max(0, 1950 - effectiveWantsUSD), currentCurrency)} Buffer Left</span>
            <span className="text-[#006948] font-bold">Controlled</span>
          </div>
        </div>

        {/* Wealth Building */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#006948]"></span>
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                Wealth Building (20%)
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#005137] text-xs font-bold">
              19.4% Actual
            </span>
          </div>
          <p className="text-xs text-[#3d4a42] mb-4">
            Priority capital deployment: high-yield cash reserves, Roth IRA, future investments.
          </p>
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-headline text-xl font-bold text-[#0b1c30]">
              {formatCurrency(1260, currentCurrency)}
            </span>
            <span className="text-xs text-[#3d4a42]">Target: {formatCurrency(1300, currentCurrency)}</span>
          </div>
          <div className="w-full bg-[#e5eeff] h-2 rounded-full overflow-hidden">
            <div className="bg-[#006948] h-full rounded-full" style={{ width: '96.9%' }}></div>
          </div>
          <div className="flex justify-between items-center mt-3 text-xs text-[#3d4a42]">
            <span>{formatCurrency(40, currentCurrency)} to hit quota</span>
            <span className="text-[#006948] font-bold">Compounding</span>
          </div>
        </div>
      </div>

      {/* Main Asymmetric Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Table & Streams (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Categorized Expense Engine Table */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-headline text-lg font-bold text-[#0b1c30]">
                  Categorized Expense Engine
                </h2>
                <p className="text-xs text-[#3d4a42]">
                  Auto-tagged telemetry comparing target rule budgets against real settlement records ({currentCurrency}).
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowOriginalFX(!showOriginalFX)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    showOriginalFX
                      ? 'bg-[#006948]/10 text-[#006948]'
                      : 'bg-[#eff4ff] text-[#3d4a42]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">language</span>
                  <span>Original FX Visible</span>
                </button>

                <select
                  value={streamFilter}
                  onChange={(e) => setStreamFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-xs font-bold border-none outline-none cursor-pointer"
                >
                  <option value="all">All Streams</option>
                  <option value="Essential Needs">Essential Needs</option>
                  <option value="Lifestyle & Wants">Lifestyle &amp; Wants</option>
                  <option value="Wealth Building">Wealth Building</option>
                </select>

                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#006948] text-white text-xs font-bold hover:bg-[#00855d] transition-all cursor-pointer shadow-xs"
                >
                  + Add Custom Category
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] text-[#3d4a42] text-xs font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4 rounded-l-xl">Category &amp; Stream</th>
                    <th className="py-2.5 px-3">Rule %</th>
                    <th className="py-2.5 px-3">Projected ({currentCurrency})</th>
                    <th className="py-2.5 px-3">Actual ({currentCurrency})</th>
                    <th className="py-2.5 px-3">Variance</th>
                    <th className="py-2.5 px-4 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y-0 text-[#0b1c30]">
                  {filteredCategories.map((cat) => {
                    // Reactive for dining category if simulation is changed
                    const isDining = cat.name === 'Dining & Social Food';
                    const actualAmtUSD = isDining ? diningSimulationUSD : cat.actual;
                    const varianceUSD = actualAmtUSD - cat.projected;

                    return (
                      <tr key={cat.id} className="hover:bg-[#eff4ff]/60 transition-colors border-b border-[#eff4ff]/60">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#dae2fd]/50 flex items-center justify-center text-[#565e74]">
                            <span className="material-symbols-outlined text-[18px]">
                              {cat.icon}
                            </span>
                          </div>
                          <div>
                            <div className="font-headline text-xs font-bold text-[#0b1c30]">
                              {cat.name}
                            </div>
                            <div className="text-[11px] text-[#3d4a42]">
                              {cat.stream}
                            </div>
                            {showOriginalFX && cat.foreignNote && (
                              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006948] mt-0.5">
                                <span className="material-symbols-outlined text-[12px]">euro</span>
                                <span>{cat.foreignNote}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-semibold text-[#0b1c30]">
                          {cat.rulePct.toFixed(1)}%
                        </td>

                        <td className="py-3 px-3 text-[#3d4a42] tabular-nums">
                          {formatCurrency(cat.projected, currentCurrency)}
                        </td>

                        <td className="py-3 px-3 font-bold text-[#0b1c30] tabular-nums">
                          {formatCurrency(actualAmtUSD, currentCurrency)}
                        </td>

                        <td className="py-3 px-3 tabular-nums">
                          {varianceUSD > 0 ? (
                            <span className="text-[#ba1a1a] font-bold">
                              +{formatCurrency(varianceUSD, currentCurrency)}
                            </span>
                          ) : varianceUSD < 0 ? (
                            <span className="text-[#006948] font-bold">
                              -{formatCurrency(Math.abs(varianceUSD), currentCurrency)}
                            </span>
                          ) : (
                            <span className="text-[#3d4a42]">{formatCurrency(0, currentCurrency)}</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          {varianceUSD > 25 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                              Alert
                            </span>
                          ) : varianceUSD > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                              Alert (+{Math.round((varianceUSD / cat.projected) * 100)}%)
                            </span>
                          ) : varianceUSD < 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#85f8c4]/30 text-[#005137] text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span>
                              Under Budget
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#85f8c4]/30 text-[#005137] text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#006948]"></span>
                              On Track
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Automated Expense Streams */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-lg font-bold text-[#0b1c30]">
                  Live Automated Expense Streams
                </h3>
                <p className="text-xs text-[#3d4a42]">
                  Real-time ledger categorized by Wealthora machine classifier in {currentCurrency}.
                </p>
              </div>
              <span className="text-xs font-bold text-[#006948] px-3 py-1 bg-[#e5eeff] rounded-xl">
                Instant Settlement
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Essential Needs */}
              <div className="flex flex-col gap-2 bg-[#eff4ff] p-4 rounded-xl">
                <div className="flex items-center justify-between pb-1 border-b border-[#bccac0]/25">
                  <span className="font-headline text-xs font-bold text-[#0b1c30]">Essential Needs</span>
                  <span className="text-xs font-bold text-[#565e74]">
                    {formatCurrency(2900, currentCurrency, { showCents: false })}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Rent Ledger</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(1650, currentCurrency, { showCents: false })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Groceries Batch</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(580, currentCurrency, { showCents: false })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Power &amp; Fiber</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(300, currentCurrency, { showCents: false })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Transit Passes</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(220, currentCurrency, { showCents: false })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Health Co-Pays</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(150, currentCurrency, { showCents: false })}</span>
                  </div>
                </div>
              </div>

              {/* Lifestyle & Wants */}
              <div className="flex flex-col gap-2 bg-[#eff4ff] p-4 rounded-xl">
                <div className="flex items-center justify-between pb-1 border-b border-[#bccac0]/25">
                  <span className="font-headline text-xs font-bold text-[#0b1c30]">Lifestyle &amp; Wants</span>
                  <span className="text-xs font-bold text-[#565e74]">
                    {formatCurrency(effectiveWantsUSD, currentCurrency, { showCents: false })}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Dining Out &amp; Bars</span>
                    <span className="font-bold text-[#0b1c30]">
                      {formatCurrency(diningSimulationUSD, currentCurrency, { showCents: false })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Retail Shopping</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(320, currentCurrency, { showCents: false })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Streaming &amp; Cinema</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(180, currentCurrency, { showCents: false })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Fitness Club</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(90, currentCurrency, { showCents: false })}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#3d4a42] italic">
                    <span>Micro-transactions</span>
                    <span>{formatCurrency(0, currentCurrency, { showCents: false })}</span>
                  </div>
                </div>
              </div>

              {/* Automated Wealth */}
              <div className="flex flex-col gap-2 bg-[#eff4ff] p-4 rounded-xl">
                <div className="flex items-center justify-between pb-1 border-b border-[#bccac0]/25">
                  <span className="font-headline text-xs font-bold text-[#0b1c30]">Automated Wealth</span>
                  <span className="text-xs font-bold text-[#006948]">
                    {formatCurrency(1300, currentCurrency, { showCents: false })}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Emergency High-Yield</span>
                    <span className="font-bold text-[#006948]">{formatCurrency(500, currentCurrency, { showCents: false })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Roth IRA Contribution</span>
                    <span className="font-bold text-[#006948]">{formatCurrency(500, currentCurrency, { showCents: false })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Vacation Reserve</span>
                    <span className="font-bold text-[#006948]">{formatCurrency(300, currentCurrency, { showCents: false })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#0b1c30]">Auto Dividend Reinvest</span>
                    <span className="font-bold text-[#006948]">Active</span>
                  </div>
                  <div className="flex justify-between items-center text-[#006948] font-bold">
                    <span>Sweep Efficiency</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right (4 Cols): What-If Simulator & Sweep Targets */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* What-If Expense Simulator */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#006948]/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006948] text-[22px]">auto_graph</span>
                <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                  What-If Expense Simulator
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#3d4a42]">
                Live Compounder
              </span>
            </div>

            <p className="text-xs text-[#3d4a42]">
              Adjust discretionary category outlays to calculate instant liquidity reallocation and 7% compounded portfolio gains.
            </p>

            {/* Slider */}
            <div className="flex flex-col gap-2 bg-[#eff4ff] p-3.5 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0b1c30]">Dining &amp; Social Food</span>
                <span className="font-headline text-base font-bold text-[#0b1c30]">
                  {formatCurrency(diningSimulationUSD, currentCurrency, { showCents: false })}/mo
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                step="25"
                value={diningSimulationUSD}
                onChange={(e) => {
                  setDiningSimulationUSD(Number(e.target.value));
                  setRuleApplied(false);
                }}
                className="w-full accent-[#006948] h-2 bg-[#e5eeff] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#3d4a42] font-semibold">
                <span>{formatCurrency(100, currentCurrency, { showCents: false })} Lean</span>
                <span className="text-[#565e74] font-bold">Orig {formatCurrency(450, currentCurrency, { showCents: false })}</span>
                <span>{formatCurrency(600, currentCurrency, { showCents: false })} Splurge</span>
              </div>
            </div>

            {/* Delta Display */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-[#e5eeff] flex flex-col">
                <span className="text-[11px] text-[#3d4a42] font-semibold">Monthly Delta</span>
                <span
                  className={`font-headline text-base sm:text-lg font-bold mt-0.5 ${
                    deltaMonthlyUSD >= 0 ? 'text-[#006948]' : 'text-[#ba1a1a]'
                  }`}
                >
                  {deltaMonthlyUSD >= 0
                    ? `+${formatCurrency(deltaMonthlyUSD, currentCurrency)}`
                    : `-${formatCurrency(Math.abs(deltaMonthlyUSD), currentCurrency)}`}
                </span>
                <span className="text-[10px] text-[#3d4a42] mt-0.5">redirected to safe cash</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#85f8c4]/20 flex flex-col">
                <span className="text-[11px] text-[#005137] font-semibold">1-Year Capital Freed</span>
                <span
                  className={`font-headline text-base sm:text-lg font-bold mt-0.5 ${
                    annualFreedUSD >= 0 ? 'text-[#006948]' : 'text-[#ba1a1a]'
                  }`}
                >
                  {annualFreedUSD >= 0
                    ? `+${formatCurrency(annualFreedUSD, currentCurrency)}`
                    : `-${formatCurrency(Math.abs(annualFreedUSD), currentCurrency)}`}
                </span>
                <span className="text-[10px] text-[#3d4a42] mt-0.5">straight savings</span>
              </div>
            </div>

            {/* 10-Year Invested Compound Card */}
            <div className="p-3.5 rounded-xl bg-[#dce9ff] flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#0b1c30]">10-Year Invested Compound</span>
                <span className="font-headline text-sm font-bold text-[#006948]">
                  {compound10YrUSD > 0
                    ? `+${formatCurrency(compound10YrUSD, currentCurrency, { showCents: false })}`
                    : formatCurrency(0, currentCurrency)}
                </span>
              </div>
              <p className="text-[11px] text-[#3d4a42]">
                Assumes surplus routed directly to Wealthora index at historical 7.2% annual net returns.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setRuleApplied(true);
                  onShowToast(`Allocation rule locked: Dining budget capped at ${formatCurrency(diningSimulationUSD, currentCurrency, { showCents: false })}/mo`, 'lock');
                }}
                className={`w-full py-2.5 rounded-xl text-white font-headline text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  ruleApplied
                    ? 'bg-[#00855d]'
                    : 'bg-[#006948] hover:bg-[#00855d]'
                }`}
              >
                {ruleApplied ? 'Rule Enforced & Active!' : 'Lock Allocation Rule'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDiningSimulationUSD(450);
                  setRuleApplied(false);
                  onShowToast('Simulator reset to original defaults.');
                }}
                className="w-full py-2 text-[#3d4a42] text-xs font-bold hover:text-[#0b1c30] transition-colors cursor-pointer text-center"
              >
                Reset Simulator Defaults
              </button>
            </div>
          </div>

          {/* Automated Sweep Targets Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col gap-3">
            <h4 className="font-headline text-base font-bold text-[#0b1c30]">
              Automated Sweep Targets
            </h4>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#eff4ff]">
              <img
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-[#bccac0]/30 shadow-2xs"
                alt="Modern geometric bank vault lock icon"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKVc-BCii0kxOhKbQ1br9VGeKadCS4kur1F3lNW4ePjDaIr5DDkkFEwA783RR6RlXmIUw0btCRlXEOM-olAVw6F7lCtM2oX-8wd13VkBAx-YhbCWGwVAUZLUP6waDursbTF4_VjGnEy8kGAXHAmJ6UjcGiVdbxYW2Yk2TJVjN6GN25lyrPVrrwfPMc3yqrl6ePOrpzbuJvk9vvGg2dBVM1HG3uOveZKo_fQytqPbD2KncpBAvR2YbJ"
              />
              <div className="flex flex-col">
                <span className="font-headline text-xs font-bold text-[#0b1c30]">
                  Surplus Cash Sweep
                </span>
                <span className="text-[11px] text-[#3d4a42] mt-0.5">
                  Any unspent balance sweeps to 4.85% APY Vault every Sunday at midnight.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#bccac0]/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                Add Expense Category
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="text-[#3d4a42] hover:text-[#0b1c30] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[#0b1c30] block mb-1">Category Label</label>
                <input
                  type="text"
                  placeholder="e.g. Pet Care, Subscriptions"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#eff4ff] rounded-xl text-xs font-medium text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#006948]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0b1c30] block mb-1">Bucket Stream</label>
                <select
                  value={newCatStream}
                  onChange={(e) => setNewCatStream(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#eff4ff] rounded-xl text-xs font-semibold text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#006948]"
                >
                  <option value="Essential Needs">Essential Needs (50%)</option>
                  <option value="Lifestyle & Wants">Lifestyle &amp; Wants (30%)</option>
                  <option value="Wealth Building">Wealth Building (20%)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#0b1c30] block mb-1">
                    Monthly Projected ({currentCurrency})
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newCatBudget}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d.]/g, '').replace(/^0+(?=\d)/, '');
                      setNewCatBudget(cleaned === '' ? 0 : Number(cleaned));
                    }}
                    className="w-full px-3 py-2 bg-[#eff4ff] rounded-xl text-xs font-bold text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0b1c30] block mb-1">Rule Weight (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newCatWeight}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d.]/g, '').replace(/^0+(?=\d)/, '');
                      setNewCatWeight(cleaned === '' ? 0 : Number(cleaned));
                    }}
                    className="w-full px-3 py-2 bg-[#eff4ff] rounded-xl text-xs font-bold text-[#0b1c30] outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-[#eff4ff]">
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="px-4 py-2 rounded-xl text-[#3d4a42] text-xs font-semibold hover:bg-[#eff4ff] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 rounded-xl bg-[#006948] text-white text-xs font-bold hover:bg-[#00855d] cursor-pointer"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
