import React, { useState, useId, useEffect } from 'react';
import { AutomationFramework, CurrencyCode, PayFrequency } from '../types';
import { CURRENCIES } from '../data/initialData';
import { formatCurrency, getCurrencySymbol, convertAmount } from '../utils/currency';

interface SalaryCalculatorProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  onShowToast: (msg: string, icon?: string) => void;
  onOpenFXRoutes: () => void;
}

export const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({
  currentCurrency,
  onCurrencyChange,
  onShowToast,
  onOpenFXRoutes,
}) => {
  const salaryInputId = useId();
  const ruleSelectId = useId();

  // Salary stored in USD base so conversions are always mathematically exact
  const [baseSalaryUSD, setBaseSalaryUSD] = useState<number>(6500);
  const [displaySalaryStr, setDisplaySalaryStr] = useState<string>('6500');
  const [frequency, setFrequency] = useState<PayFrequency>('monthly');
  const [activeRule, setActiveRule] = useState<AutomationFramework>('50_30_20');
  const [engineActive, setEngineActive] = useState<boolean>(true);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Proportional percentages of total salary for categories
  const [housingPct, setHousingPct] = useState<number>(30);
  const [groceryPct, setGroceryPct] = useState<number>(12);
  const [transportPct, setTransportPct] = useState<number>(8);
  const [subsPct, setSubsPct] = useState<number>(5);

  const currencyObj = CURRENCIES[currentCurrency] || CURRENCIES.USD;
  const currencySymbol = getCurrencySymbol(currentCurrency);

  // Whenever baseSalaryUSD or currentCurrency changes, sync displaySalaryStr without leading zeros
  useEffect(() => {
    const converted = convertAmount(baseSalaryUSD, currentCurrency);
    const val = currentCurrency === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100;
    // Ensure no leading zeros
    const str = String(val).replace(/^0+(?=\d)/, '');
    setDisplaySalaryStr(str || '0');
  }, [baseSalaryUSD, currentCurrency]);

  const handleInputChange = (rawVal: string) => {
    // Keep only numbers and at most one decimal point
    let cleaned = rawVal.replace(/[^\d.]/g, '');
    
    // Prevent multiple decimals
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // Disallow leading/prefix zeros (e.g. "065000" -> "65000", "007" -> "7", but allow "0" or "0.5")
    if (cleaned.startsWith('0') && cleaned.length > 1 && cleaned[1] !== '.') {
      cleaned = cleaned.replace(/^0+/, '');
      if (cleaned === '') cleaned = '0';
    }

    setDisplaySalaryStr(cleaned);
    const numVal = parseFloat(cleaned) || 0;
    const rate = currencyObj.rateAgainstUSD || 1;
    setBaseSalaryUSD(numVal / rate);
  };

  // Calculation helpers in USD
  const getEffectiveMonthlySalaryUSD = (): number => {
    let baseMonthly = baseSalaryUSD;
    if (frequency === 'biweekly') {
      baseMonthly = (baseSalaryUSD * 26) / 12;
    } else if (frequency === 'annual') {
      baseMonthly = baseSalaryUSD / 12;
    }
    return baseMonthly;
  };

  const monthlyBaseUSD = getEffectiveMonthlySalaryUSD();

  // High Level Ratios
  let needsRatio = 0.50;
  let wantsRatio = 0.30;
  let savingsRatio = 0.20;

  if (activeRule === '60_20_20') {
    needsRatio = 0.60;
    wantsRatio = 0.20;
    savingsRatio = 0.20;
  } else if (activeRule === '70_20_10') {
    needsRatio = 0.70;
    wantsRatio = 0.20;
    savingsRatio = 0.10;
  } else if (activeRule === 'custom') {
    const currentNeedsPct = housingPct + groceryPct + transportPct;
    needsRatio = currentNeedsPct / 100;
    wantsRatio = (subsPct * 3) / 100;
    savingsRatio = Math.max(0, 1 - needsRatio - wantsRatio);
  }

  const needsValUSD = monthlyBaseUSD * needsRatio;
  const wantsValUSD = monthlyBaseUSD * wantsRatio;
  const savingsValUSD = monthlyBaseUSD * savingsRatio;

  // Category values in USD
  const housingAmtUSD = monthlyBaseUSD * (housingPct / 100);
  const groceryAmtUSD = monthlyBaseUSD * (groceryPct / 100);
  const transportAmtUSD = monthlyBaseUSD * (transportPct / 100);
  const subsAmtUSD = monthlyBaseUSD * (subsPct / 100);

  // Rule change handler
  const handleRuleChange = (rule: AutomationFramework) => {
    setActiveRule(rule);
    if (rule === '50_30_20') {
      setHousingPct(30);
      setGroceryPct(12);
      setTransportPct(8);
      setSubsPct(5);
      onShowToast('Applied 50/30/20 Standard Rule');
    } else if (rule === '60_20_20') {
      setHousingPct(36);
      setGroceryPct(14);
      setTransportPct(10);
      setSubsPct(4);
      onShowToast('Applied 60/20/20 Balanced Essentials');
    } else if (rule === '70_20_10') {
      setHousingPct(42);
      setGroceryPct(16);
      setTransportPct(12);
      setSubsPct(3);
      onShowToast('Applied 70/20/10 Aggressive Wealth');
    }
  };

  const handleSlider = (cat: 'housing' | 'grocery' | 'transport' | 'subs', val: number) => {
    if (activeRule !== 'custom') {
      setActiveRule('custom');
    }
    if (cat === 'housing') setHousingPct(val);
    if (cat === 'grocery') setGroceryPct(val);
    if (cat === 'transport') setTransportPct(val);
    if (cat === 'subs') setSubsPct(val);
  };

  const handleResetDefaults = () => {
    handleRuleChange('50_30_20');
  };

  const handleSimulateRaise = () => {
    const newSalaryUSD = Math.round(baseSalaryUSD * 1.10);
    setBaseSalaryUSD(newSalaryUSD);
    onShowToast(`Simulated +10% salary adjustment: ${formatCurrency(newSalaryUSD, currentCurrency)}`, 'trending_up');
  };

  const handleApplyAndLock = () => {
    setIsLocking(true);
    setTimeout(() => {
      setIsLocking(false);
      setIsLocked(true);
      onShowToast('Payroll split instruction successfully confirmed with Chase & MintVault Treasury.', 'lock');
    }, 1100);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    onShowToast(`Generating encrypted PDF audit report in ${currentCurrency}...`, 'description');
    setTimeout(() => {
      setIsExporting(false);
      onShowToast('PDF audit report downloaded to your device.', 'file_download_done');
    }, 1000);
  };

  // Chart representation
  const nPct = Math.round(needsRatio * 100);
  const wPct = Math.round(wantsRatio * 100);
  const sPct = Math.max(0, 100 - nPct - wPct);

  const presetsUSD = [4500, 6500, 8500, 12000];

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Top Command Header & Salary Simulator */}
      <div className="relative w-full rounded-2xl bg-white shadow-md p-6 lg:p-8 overflow-hidden border border-[#bccac0]/25">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#85f8c4]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-24 w-64 h-64 rounded-full bg-[#dae2fd]/40 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-6">
          {/* Breadcrumb & Status Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3d4a42]">
              <span>Wealth Automation</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-[#006948] font-bold text-sm">Smart Salary Splitter v3.4</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#85f8c4]/40 text-[#005137] text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#006948] animate-pulse"></span>
              Auto-Sync Active &bull; Chase ****4921
            </div>
          </div>

          {/* Main Input Deck */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Salary Value Entry */}
            <div className="lg:col-span-5 flex flex-col gap-1.5">
              <label htmlFor={salaryInputId} className="text-xs font-semibold text-[#3d4a42] flex items-center justify-between">
                <span>Net Take-Home Pay ({currentCurrency})</span>
                <span className="text-[#006948] font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Verified via Plaid API
                </span>
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-4 font-headline text-2xl font-bold text-[#006948]">
                  {currencySymbol}
                </span>
                <input
                  id={salaryInputId}
                  type="text"
                  inputMode="decimal"
                  value={displaySalaryStr}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={() => {
                    if (!displaySalaryStr || parseFloat(displaySalaryStr) === 0) {
                      setDisplaySalaryStr('0');
                    }
                  }}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-headline text-2xl font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006948]/30 focus:shadow-md transition-all tabular-nums"
                  placeholder="0"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <span className="text-xs font-semibold text-[#3d4a42] mr-1">Presets:</span>
                {presetsUSD.map((presetUSD) => {
                  const isSelected = Math.abs(baseSalaryUSD - presetUSD) < 2;
                  return (
                    <button
                      key={presetUSD}
                      type="button"
                      onClick={() => {
                        setBaseSalaryUSD(presetUSD);
                        onShowToast(`Applied preset: ${formatCurrency(presetUSD, currentCurrency, { showCents: false })}`);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#006948] text-white shadow-xs'
                          : 'bg-[#e5eeff] text-[#0b1c30] hover:bg-[#006948] hover:text-white'
                      }`}
                    >
                      {formatCurrency(presetUSD, currentCurrency, { showCents: false })}
                    </button>
                  );
                })}
              </div>

              {/* Base Currency selection bar */}
              <div className="flex flex-col gap-1 pt-2 mt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#3d4a42] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#006948]">currency_exchange</span>
                    Base Currency:
                  </span>
                  <span className="text-[11px] font-semibold text-[#006948] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
                    Real-time FX conversion active ({currentCurrency})
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CHF'] as CurrencyCode[]).map((cCode) => {
                    const c = CURRENCIES[cCode];
                    const isSelected = currentCurrency === cCode;
                    return (
                      <button
                        key={cCode}
                        type="button"
                        onClick={() => onCurrencyChange(cCode)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#006948] text-white shadow-xs ring-2 ring-[#006948]/30 font-bold'
                            : 'bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30]'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${isSelected ? 'bg-white/30' : 'bg-[#d3e4fe]'}`}>
                          {c.symbol}
                        </span>
                        {c.code}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Frequency Toggle */}
            <div className="lg:col-span-3 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#3d4a42]">Pay Frequency</label>
              <div className="flex items-center p-1 rounded-xl bg-[#eff4ff]">
                {(['biweekly', 'monthly', 'annual'] as PayFrequency[]).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => {
                      setFrequency(freq);
                      onShowToast(`Adjusted frequency to ${freq === 'biweekly' ? 'Bi-Weekly' : freq === 'annual' ? 'Annual' : 'Monthly'}`);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${
                      frequency === freq
                        ? 'bg-white text-[#006948] shadow-xs'
                        : 'text-[#3d4a42] hover:text-[#0b1c30]'
                    }`}
                  >
                    {freq === 'biweekly' ? 'Bi-Weekly' : freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Automation Framework Selector */}
            <div className="lg:col-span-4 flex flex-col gap-1.5">
              <label htmlFor={ruleSelectId} className="text-xs font-semibold text-[#3d4a42]">Automation Framework</label>
              <div className="relative">
                <select
                  id={ruleSelectId}
                  value={activeRule}
                  onChange={(e) => handleRuleChange(e.target.value as AutomationFramework)}
                  className="w-full appearance-none px-4 py-2.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-sm font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006948]/30 focus:shadow-md transition-all cursor-pointer pr-10"
                >
                  <option value="50_30_20">50/30/20 Rule (Standard)</option>
                  <option value="60_20_20">60/20/20 Balanced Essentials</option>
                  <option value="70_20_10">70/20/10 Aggressive Wealth</option>
                  <option value="custom">Zero-Based Granular Custom</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#3d4a42]">
                  tune
                </span>
              </div>
            </div>
          </div>

          {/* International Settlement Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#eff4ff] border border-[#006948]/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#006948]/10 flex items-center justify-center text-[#006948]">
                <span className="material-symbols-outlined text-[18px]">public</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#0b1c30] block">
                  Multi-Currency International Settlement Enabled
                </span>
                <span className="text-[11px] text-[#3d4a42]">
                  Receive salary in foreign currencies (EUR, GBP, JPY, CAD, INR, CHF) with guaranteed 24h Auto-FX Lock.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#85f8c4]/40 text-[#005137] text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#006948]">lock</span>
                0.05% Interbank FX Spread
              </span>
              <button
                type="button"
                onClick={onOpenFXRoutes}
                className="px-3 py-1 rounded-lg bg-white text-[#006948] hover:bg-[#006948] hover:text-white transition-all text-xs font-bold shadow-xs border border-[#bccac0]/60 cursor-pointer"
              >
                Manage FX Routes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Summary Tiles (4 Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Take-Home */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-white shadow-xs border border-[#bccac0]/25 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#3d4a42]">Gross Take-Home</span>
            <span className="material-symbols-outlined text-[#006948] p-2 rounded-xl bg-[#eff4ff] text-[20px]">
              account_balance_wallet
            </span>
          </div>
          <div className="mt-4">
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight tabular-nums">
              {formatCurrency(monthlyBaseUSD, currentCurrency)}
            </div>
            <p className="text-xs text-[#3d4a42] mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#006948]">check_circle</span>
              Ready for scheduled split
            </p>
          </div>
        </div>

        {/* Living Expenses (Needs) */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-white shadow-xs border border-[#bccac0]/25 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#565e74]"></span>
              <span className="text-xs font-semibold text-[#3d4a42]">Automated Needs</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-xs font-bold text-[#565e74]">
              {Math.round(needsRatio * 100)}%
            </span>
          </div>
          <div className="mt-4">
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight tabular-nums">
              {formatCurrency(needsValUSD, currentCurrency)}
            </div>
            <p className="text-xs text-[#3d4a42] mt-1">Shelter, groceries, baseline</p>
          </div>
        </div>

        {/* Flexible / Discretionary (Wants) */}
        <div className="flex flex-col justify-between p-5 rounded-2xl bg-white shadow-xs border border-[#bccac0]/25 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a]"></span>
              <span className="text-xs font-semibold text-[#3d4a42]">Discretionary Fun</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#e5eeff] text-xs font-bold text-[#006948]">
              {Math.round(wantsRatio * 100)}%
            </span>
          </div>
          <div className="mt-4">
            <div className="font-headline text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight tabular-nums">
              {formatCurrency(wantsValUSD, currentCurrency)}
            </div>
            <p className="text-xs text-[#3d4a42] mt-1">Dining, hobby, lifestyle spend</p>
          </div>
        </div>

        {/* Auto-Save & Invest (Savings) */}
        <div className="relative flex flex-col justify-between p-5 rounded-2xl bg-[#006948] text-white shadow-md overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-[#00855d]/60 pointer-events-none"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#85f8c4]"></span>
              <span className="text-xs font-semibold text-white">Wealth Auto-Transfer</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#00855d] text-[#f5fff7] text-xs font-bold">
              +18% MoM
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="font-headline text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums">
              {formatCurrency(savingsValUSD, currentCurrency)}
            </div>
            <p className="text-xs text-white/80 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#85f8c4]">trending_up</span>
              {sPct}% allocated automatically
            </p>
          </div>
        </div>
      </div>

      {/* Main Asymmetric Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Detailed Expenses Breakdown (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="font-headline text-xl font-bold text-[#0b1c30]">
                Target Allocation Buckets
              </h2>
              <p className="text-xs text-[#3d4a42]">
                Live sliders re-balance automated debits across linked sub-vaults ({currentCurrency}).
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1 text-xs font-bold text-[#006948] hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Reset Defaults
            </button>
          </div>

          {/* Expense Card 1: Housing & Primary Shelter */}
          <div className="p-5 rounded-2xl bg-white shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e5eeff] flex items-center justify-center text-[#006948]">
                  <span className="material-symbols-outlined text-[20px]">roofing</span>
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                    Housing &amp; Primary Shelter
                  </h3>
                  <p className="text-xs text-[#3d4a42]">Mortgage, energy, water, fiber-optic</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-headline text-lg font-bold text-[#0b1c30] tabular-nums">
                  {formatCurrency(housingAmtUSD, currentCurrency)}
                </span>
                <div className="text-xs text-[#006948] font-bold">
                  {housingPct.toFixed(1)}% of total
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-[#3d4a42] font-semibold">
                <span>Adaptive Threshold</span>
                <span className="tabular-nums font-bold text-[#0b1c30]">{housingPct}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                step="1"
                value={housingPct}
                onChange={(e) => handleSlider('housing', Number(e.target.value))}
                className="w-full accent-[#006948] h-2 bg-[#e5eeff] rounded-lg cursor-pointer"
              />
            </div>

            {/* Sub-items Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-[#eff4ff] text-center">
                <span className="text-[11px] text-[#3d4a42] block">Rent/Mortgage</span>
                <span className="text-xs font-bold text-[#0b1c30] tabular-nums">
                  {formatCurrency(housingAmtUSD * 0.79, currentCurrency, { showCents: false })}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#eff4ff] text-center">
                <span className="text-[11px] text-[#3d4a42] block">Power Grid</span>
                <span className="text-xs font-bold text-[#0b1c30] tabular-nums">
                  {formatCurrency(housingAmtUSD * 0.10, currentCurrency, { showCents: false })}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#eff4ff] text-center">
                <span className="text-[11px] text-[#3d4a42] block">Fiber Internet</span>
                <span className="text-xs font-bold text-[#0b1c30] tabular-nums">
                  {formatCurrency(housingAmtUSD * 0.045, currentCurrency, { showCents: false })}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#eff4ff] text-center">
                <span className="text-[11px] text-[#3d4a42] block">Municipal/Water</span>
                <span className="text-xs font-bold text-[#0b1c30] tabular-nums">
                  {formatCurrency(housingAmtUSD * 0.065, currentCurrency, { showCents: false })}
                </span>
              </div>
            </div>
          </div>

          {/* Expense Card 2: Groceries & Household Essentials */}
          <div className="p-5 rounded-2xl bg-white shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#dae2fd]/50 flex items-center justify-center text-[#565e74]">
                  <span className="material-symbols-outlined text-[20px]">local_mall</span>
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                    Groceries &amp; Household Essentials
                  </h3>
                  <p className="text-xs text-[#3d4a42]">Whole Foods, local farmers market, toiletries</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-headline text-lg font-bold text-[#0b1c30] tabular-nums">
                  {formatCurrency(groceryAmtUSD, currentCurrency)}
                </span>
                <div className="text-xs text-[#565e74] font-bold">
                  {groceryPct.toFixed(1)}% of total
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-[#3d4a42] font-semibold">
                <span>Adaptive Threshold</span>
                <span className="tabular-nums font-bold text-[#0b1c30]">{groceryPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={groceryPct}
                onChange={(e) => handleSlider('grocery', Number(e.target.value))}
                className="w-full accent-[#565e74] h-2 bg-[#e5eeff] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Expense Card 3: Transportation & Mobility */}
          <div className="p-5 rounded-2xl bg-white shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d3e4fe]/50 flex items-center justify-center text-[#3d4a42]">
                  <span className="material-symbols-outlined text-[20px]">commute</span>
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                    Transportation &amp; Mobility
                  </h3>
                  <p className="text-xs text-[#3d4a42]">EV charging, metro transit pass, auto insurance</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-headline text-lg font-bold text-[#0b1c30] tabular-nums">
                  {formatCurrency(transportAmtUSD, currentCurrency)}
                </span>
                <div className="text-xs text-[#3d4a42] font-bold">
                  {transportPct.toFixed(1)}% of total
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-[#3d4a42] font-semibold">
                <span>Adaptive Threshold</span>
                <span className="tabular-nums font-bold text-[#0b1c30]">{transportPct}%</span>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                step="1"
                value={transportPct}
                onChange={(e) => handleSlider('transport', Number(e.target.value))}
                className="w-full accent-[#006948] h-2 bg-[#e5eeff] rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Expense Card 4: Subscriptions & Digital Infrastructure */}
          <div className="p-5 rounded-2xl bg-white shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#dce9ff]/60 flex items-center justify-center text-[#00855d]">
                  <span className="material-symbols-outlined text-[20px]">subscriptions</span>
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                    Subscriptions &amp; Digital Infrastructure
                  </h3>
                  <p className="text-xs text-[#3d4a42]">GitHub, AWS, Spotify, Cloud Storage</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-headline text-lg font-bold text-[#0b1c30] tabular-nums">
                  {formatCurrency(subsAmtUSD, currentCurrency)}
                </span>
                <div className="text-xs text-[#006948] font-bold">
                  {subsPct.toFixed(1)}% of total
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-[#3d4a42] font-semibold">
                <span>Adaptive Threshold</span>
                <span className="tabular-nums font-bold text-[#0b1c30]">{subsPct}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="1"
                value={subsPct}
                onChange={(e) => handleSlider('subs', Number(e.target.value))}
                className="w-full accent-[#006948] h-2 bg-[#e5eeff] rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Visual Analytics & Smart Engine Dispatcher (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Visual Allocation Distribution Chart */}
          <div className="p-5 rounded-2xl bg-white shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                Allocation Split
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#005137]">
                100% Balanced
              </span>
            </div>

            {/* Donut Chart */}
            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background ring */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#eff4ff"
                    strokeWidth="3.8"
                  />
                  {/* Needs ring segment */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#006948"
                    strokeWidth="3.8"
                    strokeDasharray={`${nPct} ${100 - nPct}`}
                    strokeDashoffset="0"
                    className="transition-all duration-500"
                  />
                  {/* Wants segment */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#565e74"
                    strokeWidth="3.8"
                    strokeDasharray={`${wPct} ${100 - wPct}`}
                    strokeDashoffset={`-${nPct}`}
                    className="transition-all duration-500"
                  />
                  {/* Savings segment */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#00855d"
                    strokeWidth="3.8"
                    strokeDasharray={`${sPct} ${100 - sPct}`}
                    strokeDashoffset={`-${nPct + wPct}`}
                    className="transition-all duration-500"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[11px] font-semibold text-[#3d4a42]">Automated</span>
                  <span className="font-headline text-lg font-bold text-[#0b1c30]">100%</span>
                </div>
              </div>

              {/* Color Key Legends */}
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-[#006948]"></span>
                    <span className="text-[#0b1c30] font-medium">Fixed Needs</span>
                  </div>
                  <span className="font-bold text-[#0b1c30] tabular-nums">{nPct}%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-[#565e74]"></span>
                    <span className="text-[#0b1c30] font-medium">Discretionary</span>
                  </div>
                  <span className="font-bold text-[#0b1c30] tabular-nums">{wPct}%</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-[#00855d]"></span>
                    <span className="text-[#0b1c30] font-medium">Wealth &amp; Savings</span>
                  </div>
                  <span className="font-bold text-[#006948] tabular-nums">{sPct}%</span>
                </div>

                <div className="mt-2 pt-2 bg-[#eff4ff] p-2 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[#3d4a42]">Surplus Buffer:</span>
                  <span className="text-[#006948] font-bold">
                    {formatCurrency(0, currentCurrency)} (Zero-Deficit)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Auto-Save Engine Dispatcher Banner */}
          <div className="p-5 rounded-2xl bg-white shadow-xs border border-[#bccac0]/25 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#85f8c4]/30 flex items-center justify-center text-[#006948]">
                  <span className="material-symbols-outlined text-[22px]">bolt</span>
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                    Smart Auto-Save Engine
                  </h3>
                  <p className="text-xs text-[#3d4a42]">Autonomous fund distribution</p>
                </div>
              </div>

              {/* Toggle Nub */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={engineActive}
                  onChange={(e) => {
                    setEngineActive(e.target.checked);
                    onShowToast(e.target.checked ? 'Smart Auto-Save Engine activated.' : 'Auto-Save paused.');
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#dae2fd] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
              </label>
            </div>

            <p className="text-xs text-[#3d4a42] leading-relaxed">
              Execute automatic ACH split on the 1st of every month directly into High-Yield Vault (5.25% APY) before discretionary spending begins.
            </p>

            {/* Bank Card Preview Widget */}
            <div className="p-3.5 rounded-xl bg-[#e5eeff] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded bg-[#0b1c30] text-white flex items-center justify-center text-[10px] tracking-wider font-mono font-bold">
                  CHASE
                </div>
                <div>
                  <div className="font-headline text-sm font-bold text-[#0b1c30]">
                    Premier Checking
                  </div>
                  <div className="text-xs text-[#3d4a42]">
                    &bull;&bull;&bull;&bull; 4921 &bull; Direct Deposit Ingest
                  </div>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#006948] text-[20px]">
                verified
              </span>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-[#eff4ff] flex items-center justify-between text-xs">
              <span className="text-[#3d4a42] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#006948]">swap_horiz</span>
                Dual-Currency Sweep:
              </span>
              <span className="font-semibold text-[#006948]">
                {currentCurrency} Auto-Conversion Active
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-[#3d4a42]">
              <span>Target Recipient:</span>
              <span className="font-headline text-xs font-bold text-[#006948]">
                MintVault Treasury HYSA
              </span>
            </div>
          </div>

          {/* Quick Executive Actions Deck */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              disabled={isLocking}
              onClick={handleApplyAndLock}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-headline text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer ${
                isLocked
                  ? 'bg-[#00855d]'
                  : 'bg-[#006948] hover:bg-[#00855d]'
              }`}
            >
              {isLocking ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                  Dispatching Automated Instructions...
                </>
              ) : isLocked ? (
                <>
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  Automated Schedule Locked &bull; Active
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">lock_clock</span>
                  Apply &amp; Lock Plan Schedule
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleSimulateRaise}
                className="py-2.5 px-3 rounded-xl bg-white text-[#0b1c30] hover:bg-[#e5eeff] text-xs font-bold shadow-xs border border-[#bccac0]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#006948] text-[18px]">add_chart</span>
                Simulate Raise (+10%)
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportPDF}
                className="py-2.5 px-3 rounded-xl bg-white text-[#0b1c30] hover:bg-[#e5eeff] text-xs font-bold shadow-xs border border-[#bccac0]/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#565e74] text-[18px]">
                  {isExporting ? 'hourglass_top' : 'download'}
                </span>
                {isExporting ? 'Exporting...' : 'Export PDF Audit'}
              </button>
            </div>
          </div>

          {/* Operational Assurance Card */}
          <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#bccac0]/20 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#006948] text-[20px]">shield</span>
            <div className="text-xs text-[#3d4a42]">
              FDIC Insured sweeps up to {formatCurrency(2500000, currentCurrency, { showCents: false })} across participating network banks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
