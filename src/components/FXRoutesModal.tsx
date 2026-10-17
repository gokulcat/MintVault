import React, { useState } from 'react';
import { CURRENCIES } from '../data/initialData';
import { CurrencyCode } from '../types';

interface FXRoutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseCurrency: CurrencyCode;
  onSelectBaseCurrency: (c: CurrencyCode) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const FXRoutesModal: React.FC<FXRoutesModalProps> = ({
  isOpen,
  onClose,
  baseCurrency,
  onSelectBaseCurrency,
  onShowToast,
}) => {
  const [autoLockDuration, setAutoLockDuration] = useState('24h');
  const [targetHedgePair, setTargetHedgePair] = useState('USD_JPY');
  const [dualCurrencySweepEnabled, setDualCurrencySweepEnabled] = useState(true);

  if (!isOpen) return null;

  const handleSave = () => {
    onShowToast('FX routing protocols updated: 24h Auto-FX Lock active with 0.05% spread.', 'verified');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#bccac0]/30 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#006948]/10 text-[#006948] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">currency_exchange</span>
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-[#0b1c30]">
                Multi-Currency Settlement &amp; FX Routes
              </h3>
              <p className="text-xs text-[#3d4a42]">
                Guaranteed 0.05% Interbank spread on international payroll sweeps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#3d4a42] hover:bg-[#eff4ff] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live FX Rates Grid */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
            Live Interbank Spot Matrix
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(CURRENCIES).map(([code, cur]) => (
              <div
                key={code}
                onClick={() => onSelectBaseCurrency(code as CurrencyCode)}
                className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                  baseCurrency === code
                    ? 'border-[#006948] bg-[#006948]/5 shadow-xs'
                    : 'border-[#eff4ff] bg-[#eff4ff]/60 hover:bg-[#eff4ff]'
                }`}
              >
                <div className="text-xs font-bold text-[#0b1c30] flex items-center justify-center gap-1">
                  <span>{cur.symbol}</span>
                  <span>{code}</span>
                </div>
                <div className="text-[11px] text-[#3d4a42] font-mono mt-0.5">
                  {code === 'USD' ? 'Base (1.00)' : cur.rateAgainstUSD}
                </div>
                {baseCurrency === code && (
                  <span className="text-[9px] font-bold text-[#006948] uppercase tracking-wider block mt-0.5">
                    Active Base
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Routing Options */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="p-3 rounded-xl bg-[#eff4ff] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#0b1c30]">Auto-Sweep Multi-Currency Inflows</span>
              <span className="text-[11px] text-[#3d4a42]">
                Automatically convert incoming EUR/GBP/JPY salary directly into target vault currency
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dualCurrencySweepEnabled}
                onChange={(e) => setDualCurrencySweepEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#dae2fd] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006948]"></div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#3d4a42]">FX Lock Expiry Window</label>
              <select
                value={autoLockDuration}
                onChange={(e) => setAutoLockDuration(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#eff4ff] text-xs font-semibold text-[#0b1c30] border-none outline-none focus:ring-2 focus:ring-[#006948]"
              >
                <option value="12h">12 Hours Pre-Deposit</option>
                <option value="24h">24 Hours Guaranteed (Recommended)</option>
                <option value="48h">48 Hours Extended Window</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#3d4a42]">Priority Foreign Vault Route</label>
              <select
                value={targetHedgePair}
                onChange={(e) => setTargetHedgePair(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#eff4ff] text-xs font-semibold text-[#0b1c30] border-none outline-none focus:ring-2 focus:ring-[#006948]"
              >
                <option value="USD_JPY">JPY Sinking Fund (Tokyo Trip)</option>
                <option value="EUR_USD">EUR European Travel Hedge</option>
                <option value="GBP_USD">GBP London Business Reserve</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eff4ff]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[#3d4a42] hover:bg-[#eff4ff] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#006948] text-white hover:bg-[#00855d] shadow-sm cursor-pointer"
          >
            Save FX Route Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
