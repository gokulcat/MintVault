import React, { useState } from 'react';
import { CurrencyCode, TargetVault } from '../types';
import { CURRENCIES, INITIAL_VAULTS } from '../data/initialData';
import { formatCurrency, getCurrencySymbol, convertAmount } from '../utils/currency';

interface SavingsGoalsProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  currentCurrency,
  onCurrencyChange,
  onShowToast,
}) => {
  const [vaults, setVaults] = useState<TargetVault[]>(INITIAL_VAULTS);
  const [filterMode, setFilterMode] = useState<'all' | 'prioritized'>('all');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [roundUpMultiplier, setRoundUpMultiplier] = useState<number>(1);
  const [showRoundUpModal, setShowRoundUpModal] = useState<boolean>(false);

  // Deposit modal state
  const [depositModalOpen, setDepositModalOpen] = useState<boolean>(false);
  const [depositTargetVaultId, setDepositTargetVaultId] = useState<string>(vaults[0]?.id || 'vault-1');
  const [depositAmount, setDepositAmount] = useState<number>(250);

  // New Vault modal state
  const [newVaultModalOpen, setNewVaultModalOpen] = useState<boolean>(false);
  const [newVaultName, setNewVaultName] = useState<string>('');
  const [newVaultTarget, setNewVaultTarget] = useState<number>(5000);
  const [newVaultAuto, setNewVaultAuto] = useState<number>(200);
  const [newVaultDate, setNewVaultDate] = useState<string>('Dec 2025');
  const [newVaultCurrency, setNewVaultCurrency] = useState<CurrencyCode>(currentCurrency);

  const currencySymbol = getCurrencySymbol(currentCurrency);

  // Calculate dynamic totals in base USD
  const totalSavedUSD = vaults.reduce((acc, v) => acc + v.currentAmount, 0);
  const totalMonthlyAutoUSD = vaults.reduce((acc, v) => acc + v.monthlyAuto, 0);

  const handleConfirmDeposit = () => {
    if (depositAmount <= 0) return;
    // depositAmount is entered in currentCurrency, convert to USD base
    const rate = CURRENCIES[currentCurrency]?.rateAgainstUSD || 1.0;
    const amountInUSD = depositAmount / rate;

    setVaults((prev) =>
      prev.map((v) => {
        if (v.id === depositTargetVaultId) {
          return {
            ...v,
            currentAmount: v.currentAmount + amountInUSD,
          };
        }
        return v;
      })
    );
    const targetVault = vaults.find((v) => v.id === depositTargetVaultId);
    onShowToast(`Deposited ${formatCurrency(amountInUSD, currentCurrency)} into ${targetVault?.name || 'Vault'}!`, 'account_balance');
    setDepositModalOpen(false);
  };

  const handleCreateVault = () => {
    if (!newVaultName.trim()) return;
    const rate = CURRENCIES[newVaultCurrency]?.rateAgainstUSD || 1.0;
    const targetInUSD = Number(newVaultTarget) / rate;
    const autoInUSD = Number(newVaultAuto) / rate;

    const newV: TargetVault = {
      id: `vault-${Date.now()}`,
      name: newVaultName,
      categoryTag: 'Custom Sinking Fund',
      currentAmount: 0,
      targetAmount: targetInUSD || 5000,
      monthlyAuto: autoInUSD || 150,
      targetDate: newVaultDate,
      status: 'Starting',
      icon: 'savings',
      currency: newVaultCurrency,
    };
    setVaults([...vaults, newV]);
    onShowToast(`Created new vault: ${newVaultName}`, 'add_circle');
    setNewVaultModalOpen(false);
    setNewVaultName('');
  };

  const handleApplyTemplate = (name: string, targetUSD: number, autoUSD: number, tag: string) => {
    const newV: TargetVault = {
      id: `vault-${Date.now()}`,
      name,
      categoryTag: tag,
      currentAmount: 0,
      targetAmount: targetUSD,
      monthlyAuto: autoUSD,
      targetDate: 'Dec 2025',
      status: 'Starting',
      icon: 'bookmark',
    };
    setVaults([...vaults, newV]);
    onShowToast(`Added vault template: ${name}`);
  };

  const displayedVaults = filterMode === 'prioritized' 
    ? vaults.filter((v) => v.status === 'Ahead' || v.status === 'Almost Done')
    : vaults;

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Hero Overview Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-[#bccac0]/25 p-6 md:p-8">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#85f8c4]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-[#dce9ff]/40 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00855d] text-[#f5fff7] text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                Smart Autopilot Active
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#e5eeff] text-[#006948] text-xs font-bold">
                <span className="material-symbols-outlined text-[15px]">trending_up</span>
                4.85% APY Compounding
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#dae2fd] text-[#5c647a] text-xs font-bold">
                <span className="material-symbols-outlined text-[15px]">currency_exchange</span>
                Multi-Currency FX Yield Active
              </span>
            </div>

            <p className="font-headline text-2xl md:text-3xl font-bold text-[#0b1c30] tracking-tight mt-1">
              Total Automated Savings Active
            </p>
            <p className="text-sm text-[#3d4a42]">
              Allocating structured liquid reserves automatically every pay cycle with institutional yield protection.
            </p>

            {/* Display Currency Bar */}
            <div className="flex items-center gap-2 mt-2 pt-1 flex-wrap">
              <span className="text-xs font-bold text-[#3d4a42] uppercase tracking-wider">
                Display Currency:
              </span>
              <div className="inline-flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg">
                {(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CHF'] as CurrencyCode[]).map((cCode) => (
                  <button
                    key={cCode}
                    type="button"
                    onClick={() => onCurrencyChange(cCode)}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                      currentCurrency === cCode
                        ? 'bg-white text-[#0b1c30] shadow-xs ring-2 ring-[#006948]/30 font-bold'
                        : 'text-[#3d4a42] hover:text-[#0b1c30]'
                    }`}
                  >
                    {cCode} ({CURRENCIES[cCode]?.symbol})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-6 bg-[#eff4ff]/80 backdrop-blur-md rounded-2xl p-4 self-start lg:self-auto border border-[#bccac0]/25 shadow-2xs">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#3d4a42] uppercase tracking-wider">
                Total Saved Across Vaults
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline text-2xl md:text-3xl font-bold text-[#0b1c30] tracking-tight">
                  {formatCurrency(totalSavedUSD, currentCurrency, { showCents: false })}
                </span>
                <span className="text-sm text-[#006948] font-bold">.00</span>
              </div>
              <span className="text-xs text-[#006948] font-semibold flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                {vaults.length} Vaults Protected
              </span>
            </div>

            <div className="w-px h-12 bg-[#bccac0]/30 hidden sm:block"></div>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#3d4a42] uppercase tracking-wider">
                Monthly Inflow
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-headline text-2xl md:text-3xl font-bold text-[#006948] tracking-tight">
                  {formatCurrency(totalMonthlyAutoUSD, currentCurrency, { showCents: false })}
                </span>
                <span className="text-xs text-[#3d4a42]">/mo</span>
              </div>
              <span className="text-xs text-[#3d4a42]">
                {isPaused ? 'Auto-save paused' : 'Next run: Nov 1'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Vaults on Left, Projections & Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline text-xl font-bold text-[#0b1c30]">Target Vaults</h2>
              <p className="text-xs text-[#3d4a42]">
                Dedicated sinking funds with real-time automated yields ({currentCurrency})
              </p>
            </div>
            <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white text-[#0b1c30] shadow-xs'
                    : 'text-[#3d4a42] hover:text-[#0b1c30]'
                }`}
              >
                All Vaults ({vaults.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('prioritized')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterMode === 'prioritized'
                    ? 'bg-white text-[#0b1c30] shadow-xs'
                    : 'text-[#3d4a42] hover:text-[#0b1c30]'
                }`}
              >
                Prioritized
              </button>
            </div>
          </div>

          {/* Vaults Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedVaults.map((vault) => {
              const pct = Math.min(100, Math.round((vault.currentAmount / vault.targetAmount) * 100));
              return (
                <div
                  key={vault.id}
                  className="group bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Top Progress Line */}
                  <div className="h-1.5 w-full bg-[#dce9ff] absolute top-0 left-0">
                    <div
                      className="h-full bg-[#006948] rounded-r-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-3 pt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#dce9ff] flex items-center justify-center text-[#006948]">
                          <span className="material-symbols-outlined text-[22px]">
                            {vault.icon}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-headline text-base font-bold text-[#0b1c30] group-hover:text-[#006948] transition-colors">
                            {vault.name}
                          </h3>
                          <span className="text-xs text-[#3d4a42]">{vault.categoryTag}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {vault.isJPY && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#00855d] text-[#f5fff7] text-[11px] font-bold">
                            <span className="material-symbols-outlined text-[12px]">currency_yen</span>
                            JPY Vault
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            vault.status === 'Ahead' || vault.status === 'Almost Done'
                              ? 'bg-[#00855d] text-[#f5fff7]'
                              : vault.status === 'On Track'
                              ? 'bg-[#dce9ff] text-[#3d4a42]'
                              : 'bg-[#e5eeff] text-[#3d4a42]'
                          }`}
                        >
                          {vault.status === 'Ahead' && (
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          )}
                          {vault.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-baseline justify-between">
                      <div>
                        {vault.isJPY ? (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-headline text-xl font-bold text-[#0b1c30]">
                                &yen;{vault.foreignCurrentAmount?.toLocaleString()}
                              </span>
                              <span className="text-xs text-[#3d4a42]">
                                / &yen;{vault.foreignTargetAmount?.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs text-[#006948] font-semibold mt-0.5">
                              {currentCurrency === 'USD'
                                ? vault.hedgedUSD
                                : `≈ ${formatCurrency(vault.currentAmount, currentCurrency, { showCents: false })} / ${formatCurrency(vault.targetAmount, currentCurrency, { showCents: false })} (Hedged FX)`}
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="font-headline text-xl font-bold text-[#0b1c30]">
                              {formatCurrency(vault.currentAmount, currentCurrency, { showCents: false })}
                            </span>
                            <span className="text-xs text-[#3d4a42]">
                              {' '}
                              / {formatCurrency(vault.targetAmount, currentCurrency, { showCents: false })}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="font-headline text-base font-bold text-[#006948]">
                        {pct}%
                      </span>
                    </div>

                    <div className="w-full bg-[#e5eeff] h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-[#006948] h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 bg-[#eff4ff]/60 rounded-xl p-2.5 flex items-center justify-between text-[#3d4a42] text-xs">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-[#006948]">
                        sync_saved_locally
                      </span>
                      <span className="text-[#0b1c30] font-bold">
                        {formatCurrency(vault.monthlyAuto, currentCurrency, { showCents: false })}
                      </span>
                      /mo auto
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">
                        calendar_month
                      </span>
                      Target: <span className="text-[#0b1c30] font-bold">{vault.targetDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create New Goal Vault Card */}
            <div className="rounded-2xl p-5 bg-[#eff4ff]/60 hover:bg-[#eff4ff] border border-dashed border-[#bccac0] transition-colors flex flex-col justify-between shadow-xs">
              <div className="flex flex-col gap-2">
                <div className="w-12 h-12 rounded-xl bg-white shadow-xs flex items-center justify-center text-[#006948]">
                  <span className="material-symbols-outlined text-[28px]">add_circle</span>
                </div>
                <div>
                  <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                    Create New Goal Vault
                  </h3>
                  <p className="text-xs text-[#3d4a42] mt-1">
                    Spin up an auto-yielding sinking fund in seconds.
                  </p>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold text-[#3d4a42] uppercase tracking-wide block mb-2">
                    Quick Templates
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('Annual Taxes 2025', 4000, 350, 'Tax Reserve')}
                      className="px-2.5 py-1 rounded-full bg-white text-[#0b1c30] text-xs font-semibold hover:bg-[#00855d] hover:text-white transition-colors shadow-2xs border border-[#bccac0]/30 cursor-pointer"
                    >
                      Annual Taxes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('Holiday Gifts', 1500, 125, 'Lifestyle')}
                      className="px-2.5 py-1 rounded-full bg-white text-[#0b1c30] text-xs font-semibold hover:bg-[#00855d] hover:text-white transition-colors shadow-2xs border border-[#bccac0]/30 cursor-pointer"
                    >
                      Holiday Gifts
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('Home Repairs & Maintenance', 5000, 200, 'Real Estate')}
                      className="px-2.5 py-1 rounded-full bg-white text-[#0b1c30] text-xs font-semibold hover:bg-[#00855d] hover:text-white transition-colors shadow-2xs border border-[#bccac0]/30 cursor-pointer"
                    >
                      Home Repairs
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('Pet Care Fund', 2000, 100, 'Veterinary')}
                      className="px-2.5 py-1 rounded-full bg-white text-[#0b1c30] text-xs font-semibold hover:bg-[#00855d] hover:text-white transition-colors shadow-2xs border border-[#bccac0]/30 cursor-pointer"
                    >
                      Pet Care
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('EUR Travel Fund', 3500, 250, 'Euro Hedged')}
                      className="px-2.5 py-1 rounded-full bg-white text-[#0b1c30] text-xs font-semibold hover:bg-[#00855d] hover:text-white transition-colors shadow-2xs border border-[#bccac0]/30 cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px] text-[#006948]">public</span>
                      FX Sinking Fund
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setNewVaultModalOpen(true)}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#006948] hover:bg-[#00855d] text-white font-headline text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Custom Sinking Fund
              </button>
            </div>
          </div>

          {/* Vault Round-Up Reserve */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#dae2fd] flex items-center justify-center text-[#5c647a]">
                <span className="material-symbols-outlined text-[26px]">savings</span>
              </div>
              <div>
                <h4 className="font-headline text-base font-bold text-[#0b1c30]">
                  Vault Round-Up Reserve
                </h4>
                <p className="text-xs text-[#3d4a42]">
                  Spare change transfers boosted your vaults by{' '}
                  <span className="font-bold text-[#006948]">
                    +{formatCurrency(84.20 * roundUpMultiplier, currentCurrency)}
                  </span>{' '}
                  this month.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-xs font-semibold text-[#3d4a42]">
                Active ({roundUpMultiplier}x Multiplier)
              </span>
              <button
                type="button"
                onClick={() => setShowRoundUpModal(true)}
                className="px-4 py-2 rounded-xl bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-bold transition-colors cursor-pointer"
              >
                Configure
              </button>
            </div>
          </div>
        </div>

        {/* Right (4 Cols): 10-Year Projection & Auto-Deposit Schedule */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* 10-Year Projection Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006948] text-[20px]">insights</span>
                <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                  10-Year Projection
                </h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#00855d] text-[#f5fff7]">
                4.85% APY
              </span>
            </div>

            <p className="text-xs text-[#3d4a42]">
              Continuous {formatCurrency(totalMonthlyAutoUSD, currentCurrency, { showCents: false })}/mo automated allocation compounding over 120 months.
            </p>

            {/* SVG Projection Graph */}
            <div className="relative w-full h-44 mt-1 flex flex-col justify-end">
              <svg className="w-full h-36 overflow-visible" fill="none" viewBox="0 0 320 140">
                <defs>
                  <linearGradient id="interestGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#006948" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#006948" stopOpacity="0.0"></stop>
                  </linearGradient>
                </defs>
                <line x1="0" y1="130" x2="320" y2="130" stroke="#bccac0" strokeOpacity="0.3" strokeWidth="1" />
                <line x1="0" y1="75" x2="320" y2="75" stroke="#bccac0" strokeDasharray="4 4" strokeOpacity="0.2" strokeWidth="1" />
                <line x1="0" y1="20" x2="320" y2="20" stroke="#bccac0" strokeDasharray="4 4" strokeOpacity="0.2" strokeWidth="1" />

                {/* Base curve */}
                <path d="M 0 130 C 80 120, 160 95, 320 60 L 320 130 L 0 130 Z" fill="#dae2fd" fillOpacity="0.4" />
                <path d="M 0 130 C 80 120, 160 95, 320 60" stroke="#565e74" strokeDasharray="3 3" strokeWidth="2" />

                {/* Compound curve */}
                <path d="M 0 130 C 90 115, 180 65, 320 15 L 320 130 L 0 130 Z" fill="url(#interestGrad)" />
                <path d="M 0 130 C 90 115, 180 65, 320 15" stroke="#006948" strokeLinecap="round" strokeWidth="3" />

                <circle cx="320" cy="15" r="4" fill="#006948" />
                <circle cx="320" cy="60" r="3" fill="#565e74" />
              </svg>

              <div className="flex justify-between text-xs text-[#3d4a42] pt-2">
                <span>Year 0</span>
                <span>Year 3</span>
                <span>Year 6</span>
                <span>Year 10</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-[#eff4ff]">
                <span className="text-xs text-[#3d4a42] block font-semibold">Base Contributions</span>
                <span className="font-headline text-base font-bold text-[#0b1c30]">
                  {formatCurrency(184450, currentCurrency, { showCents: false })}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#dce9ff]">
                <span className="text-xs text-[#006948] block font-semibold">Earned Interest</span>
                <span className="font-headline text-base font-bold text-[#006948]">
                  +{formatCurrency(52830, currentCurrency, { showCents: false })}
                </span>
              </div>
            </div>
          </div>

          {/* Auto-Deposit Schedule Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006948] text-[20px]">calendar_today</span>
                <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                  Auto-Deposit Schedule
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#3d4a42]">Bi-Weekly</span>
            </div>

            <div className="p-3 rounded-xl bg-[#eff4ff] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00855d] text-[#f5fff7] flex items-center justify-center font-headline text-sm font-bold">
                  01
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0b1c30]">Upcoming Run: Nov 1, 2024</p>
                  <p className="text-[11px] text-[#3d4a42]">Chase Checking &bull;&bull;&bull;&bull; 8921</p>
                </div>
              </div>
              <span className="font-headline text-sm font-bold text-[#0b1c30]">
                {formatCurrency(totalMonthlyAutoUSD, currentCurrency)}
              </span>
            </div>

            {/* Matrix */}
            <div className="flex flex-col gap-2 pt-1 text-xs">
              <span className="text-xs font-bold text-[#3d4a42] uppercase tracking-wider">
                Automated Allocation Matrix
              </span>
              {vaults.map((v) => {
                const pct = totalMonthlyAutoUSD > 0 ? ((v.monthlyAuto / totalMonthlyAutoUSD) * 100).toFixed(1) : '0';
                return (
                  <div key={v.id} className="flex items-center justify-between py-1 border-b border-[#eff4ff] last:border-none">
                    <span className="text-[#0b1c30] font-medium">{v.name}</span>
                    <span className="font-bold text-[#0b1c30]">
                      {formatCurrency(v.monthlyAuto, currentCurrency)} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDepositModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#006948] text-white hover:bg-[#00855d] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_card</span>
                Deposit Extra Funds Now
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPaused(!isPaused);
                  onShowToast(!isPaused ? 'Auto-Save paused for November cycle.' : 'Auto-Save resumed!', !isPaused ? 'pause_circle' : 'play_circle');
                }}
                className={`w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isPaused
                    ? 'bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6]/80'
                    : 'bg-[#e5eeff] text-[#0b1c30] hover:bg-[#dce9ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isPaused ? 'play_circle' : 'pause_circle'}
                </span>
                <span>{isPaused ? 'Resume Auto-Save' : 'Pause Auto-Save (Nov)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#bccac0]/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                Instant Vault Deposit
              </h3>
              <button
                type="button"
                onClick={() => setDepositModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#3d4a42] hover:bg-[#eff4ff] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#3d4a42]">
              Inject capital directly into your highest yielding vaults without resetting your monthly automation schedule.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0b1c30]">Target Vault</label>
              <select
                value={depositTargetVaultId}
                onChange={(e) => setDepositTargetVaultId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold border-none outline-none focus:ring-2 focus:ring-[#006948]"
              >
                {vaults.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({Math.round((v.currentAmount / v.targetAmount) * 100)}% reached)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#0b1c30]">Transfer Amount ({currentCurrency})</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-[#3d4a42] text-xs font-bold">{currencySymbol}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={depositAmount}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^\d.]/g, '').replace(/^0+(?=\d)/, '');
                    setDepositAmount(cleaned === '' ? 0 : Number(cleaned));
                  }}
                  className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-xs font-bold focus:bg-white focus:ring-2 focus:ring-[#006948]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-[#eff4ff]">
              <button
                type="button"
                onClick={() => setDepositModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#3d4a42] hover:bg-[#eff4ff] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeposit}
                className="px-4 py-2 rounded-xl bg-[#006948] text-white hover:bg-[#00855d] text-xs font-bold cursor-pointer"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Sinking Fund Modal */}
      {newVaultModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#bccac0]/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                Create New Sinking Fund Vault
              </h3>
              <button
                type="button"
                onClick={() => setNewVaultModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#3d4a42] hover:bg-[#eff4ff] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-[#0b1c30] block mb-1">Vault Name</label>
                <input
                  type="text"
                  placeholder="e.g. Wedding Savings, Master's Tuition"
                  value={newVaultName}
                  onChange={(e) => setNewVaultName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-xs font-medium border-none outline-none focus:ring-2 focus:ring-[#006948]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#0b1c30] block mb-1">Target Amount ({newVaultCurrency})</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newVaultTarget}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d.]/g, '').replace(/^0+(?=\d)/, '');
                      setNewVaultTarget(cleaned === '' ? 0 : Number(cleaned));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-xs font-bold border-none outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0b1c30] block mb-1">Monthly Auto ({newVaultCurrency})</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={newVaultAuto}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d.]/g, '').replace(/^0+(?=\d)/, '');
                      setNewVaultAuto(cleaned === '' ? 0 : Number(cleaned));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-xs font-bold border-none outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#0b1c30] block mb-1">Target Completion Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Dec 2026"
                    value={newVaultDate}
                    onChange={(e) => setNewVaultDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-xs font-medium border-none outline-none focus:ring-2 focus:ring-[#006948]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#0b1c30] block mb-1">Vault Currency</label>
                  <select
                    value={newVaultCurrency}
                    onChange={(e) => setNewVaultCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold border-none outline-none focus:ring-2 focus:ring-[#006948]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CHF">CHF (Fr)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-[#eff4ff]">
              <button
                type="button"
                onClick={() => setNewVaultModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#3d4a42] hover:bg-[#eff4ff] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateVault}
                className="px-4 py-2 rounded-xl bg-[#006948] text-white hover:bg-[#00855d] text-xs font-bold cursor-pointer"
              >
                Create Sinking Fund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Round-Up Modal */}
      {showRoundUpModal && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#bccac0]/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                Configure Vault Round-Up
              </h3>
              <button
                type="button"
                onClick={() => setShowRoundUpModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#3d4a42] hover:bg-[#eff4ff] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#3d4a42]">
              Every debit or credit card purchase on linked accounts is rounded to the nearest dollar and transferred into your highest yielding vault.
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#0b1c30]">Round-Up Accelerator Multiplier</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setRoundUpMultiplier(m)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      roundUpMultiplier === m
                        ? 'border-[#006948] bg-[#006948]/10 text-[#006948]'
                        : 'border-[#bccac0]/30 hover:bg-[#eff4ff] text-[#3d4a42]'
                    }`}
                  >
                    {m}x Booster
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#eff4ff] text-xs text-[#3d4a42]">
              <div className="flex items-center justify-between font-semibold text-[#0b1c30]">
                <span>Projected Monthly Boost:</span>
                <span className="text-[#006948] font-bold">
                  +{formatCurrency(84.20 * roundUpMultiplier, currentCurrency)}
                </span>
              </div>
              <p className="text-[11px] mt-1 text-[#3d4a42]">
                Sweeps execute in batch every Sunday at 11:59 PM directly from Chase Checking.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eff4ff]">
              <button
                type="button"
                onClick={() => {
                  onShowToast(`Round-Up multiplier set to ${roundUpMultiplier}x!`, 'savings');
                  setShowRoundUpModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#006948] text-white hover:bg-[#00855d] text-xs font-bold cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
