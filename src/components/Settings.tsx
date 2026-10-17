import React, { useState } from 'react';
import { CurrencyCode } from '../types';
import { CURRENCIES } from '../data/initialData';
import { formatCurrency } from '../utils/currency';

interface SettingsProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  currentCurrency,
  onCurrencyChange,
  onShowToast,
}) => {
  const [fdicAllocation, setFdicAllocation] = useState<boolean>(true);
  const [autoFHLB, setAutoFHLB] = useState<boolean>(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState<boolean>(true);
  const [autoSweepTime, setAutoSweepTime] = useState<string>('sunday');

  const handleLinkNewBank = () => {
    onShowToast('Connecting to Plaid Link sandbox...', 'account_balance');
    setTimeout(() => {
      onShowToast('Plaid Link: Bank of America checking (•••• 1024) authenticated.', 'check_circle');
    }, 1200);
  };

  const handleSavePreferences = () => {
    onShowToast(`Institutional preferences and ${currentCurrency} sweep routes successfully saved.`, 'verified');
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#3d4a42] uppercase tracking-wider font-semibold">
          <span>Configuration</span>
          <span>/</span>
          <span className="text-[#006948] font-bold">Security &amp; Routing ({currentCurrency})</span>
        </div>
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#0b1c30] tracking-tight mt-0.5">
          Account Settings &amp; Banking Rails
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Linked Bank Accounts */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                  Linked Financial Institutions
                </h3>
                <p className="text-xs text-[#3d4a42]">
                  Direct deposit ingestion rails and automated sweep accounts
                </p>
              </div>
              <button
                type="button"
                onClick={handleLinkNewBank}
                className="px-3.5 py-1.5 rounded-xl bg-[#006948] text-white text-xs font-bold hover:bg-[#00855d] transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Connect via Plaid</span>
              </button>
            </div>

            {/* Account List */}
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-[#eff4ff] flex items-center justify-between border border-[#bccac0]/25">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-8 rounded bg-[#0b1c30] text-white flex items-center justify-center font-mono text-xs font-bold">
                    CHASE
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-xs font-bold text-[#0b1c30]">
                        Premier Checking &bull;&bull;&bull;&bull; 4921
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#85f8c4]/40 text-[#005137] text-[10px] font-bold">
                        Primary Ingest
                      </span>
                    </div>
                    <span className="text-[11px] text-[#3d4a42]">
                      Direct deposit detected &bull; ACH Split on 1st of month
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#006948]">verified</span>
              </div>

              <div className="p-4 rounded-xl bg-[#eff4ff] flex items-center justify-between border border-[#bccac0]/25">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-8 rounded bg-[#565e74] text-white flex items-center justify-center font-mono text-xs font-bold">
                    CHASE
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-xs font-bold text-[#0b1c30]">
                        Total Savings &bull;&bull;&bull;&bull; 8921
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#5c647a] text-[10px] font-bold">
                        Linked Overflow
                      </span>
                    </div>
                    <span className="text-[11px] text-[#3d4a42]">
                      Bi-weekly auto-deposit execution rail
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#006948]">check_circle</span>
              </div>
            </div>
          </div>

          {/* Automated Sweep Controls */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <h3 className="font-headline text-base font-bold text-[#0b1c30]">
              Autonomous Sweep Execution Rules
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#eff4ff]">
                <div>
                  <span className="text-xs font-bold text-[#0b1c30] block">Surplus Cash Sweep Day</span>
                  <span className="text-[11px] text-[#3d4a42]">
                    Trigger transfer of leftover checking cash into 4.85% APY Treasury
                  </span>
                </div>
                <select
                  value={autoSweepTime}
                  onChange={(e) => setAutoSweepTime(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-[#0b1c30] border border-[#bccac0]/30 outline-none"
                >
                  <option value="sunday">Sunday Midnight (Default)</option>
                  <option value="biweekly">Every Paycheck Day</option>
                  <option value="monthly">End of Month</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#eff4ff]">
                <div>
                  <span className="text-xs font-bold text-[#0b1c30] block">
                    Zero-Deficit Balance Protection
                  </span>
                  <span className="text-[11px] text-[#3d4a42]">
                    Prevent transfers if checking balance drops below {formatCurrency(1000, currentCurrency, { showCents: false })} safety threshold
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoFHLB}
                    onChange={(e) => setAutoFHLB(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#dae2fd] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#eff4ff]">
                <div>
                  <span className="text-xs font-bold text-[#0b1c30] block">
                    Multi-Bank FDIC Pass-Through Sweeps
                  </span>
                  <span className="text-[11px] text-[#3d4a42]">
                    Disperse deposits across network banks to guarantee coverage up to {formatCurrency(2500000, currentCurrency, { showCents: false })}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fdicAllocation}
                    onChange={(e) => setFdicAllocation(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#dae2fd] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Active Settlement Currency Display */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#bccac0]/25 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948] text-[22px]">currency_exchange</span>
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                Base Settlement Currency
              </h3>
            </div>
            <p className="text-xs text-[#3d4a42]">
              Select primary reporting and disbursement currency:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'CHF'] as CurrencyCode[]).map((cCode) => (
                <button
                  key={cCode}
                  type="button"
                  onClick={() => onCurrencyChange(cCode)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                    currentCurrency === cCode
                      ? 'border-[#006948] bg-[#006948]/10 text-[#006948]'
                      : 'border-[#bccac0]/30 hover:bg-[#eff4ff] text-[#0b1c30]'
                  }`}
                >
                  <span>{cCode}</span>
                  <span className="text-[11px] text-[#3d4a42]">{CURRENCIES[cCode]?.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Security & Encryption Status */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#bccac0]/25 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006948] text-[22px]">shield</span>
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">
                Security &amp; Encryption
              </h3>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#eff4ff]">
                <div>
                  <span className="font-bold text-[#0b1c30] block">Two-Factor Authentication</span>
                  <span className="text-[11px] text-[#3d4a42]">Authenticator App (TOTP)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#dae2fd] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
                </label>
              </div>

              <div className="p-3 rounded-xl bg-[#eff4ff] flex flex-col gap-1">
                <span className="font-bold text-[#0b1c30]">256-bit AES Bank-Grade Vault</span>
                <span className="text-[11px] text-[#3d4a42]">
                  End-to-end telemetry encryption with zero-knowledge keys. No financial credential storage on servers.
                </span>
                <span className="text-[10px] text-[#006948] font-bold mt-1">Status: Active &amp; Verified</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              className="w-full py-2.5 rounded-xl bg-[#006948] text-white hover:bg-[#00855d] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Save Banking Preferences
            </button>
          </div>

          {/* Data Export Card */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#bccac0]/25 flex flex-col gap-3">
            <h4 className="font-headline text-base font-bold text-[#0b1c30]">
              Auditing &amp; Data Compliance
            </h4>
            <p className="text-xs text-[#3d4a42]">
              Download full historical logs, automated transaction splits, and tax categorization schedules in {currentCurrency}.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onShowToast(`Exporting JSON data schema in ${currentCurrency}...`, 'download')}
                className="py-2 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff] text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={() => onShowToast('Generating certified compliance audit report...', 'verified')}
                className="py-2 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff] text-xs font-bold transition-colors cursor-pointer text-center"
              >
                Audit PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
