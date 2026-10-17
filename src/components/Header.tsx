import React, { useState } from 'react';
import { CurrencyCode } from '../types';
import { CURRENCIES } from '../data/initialData';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentCurrency: CurrencyCode;
  onCurrencyChange: (curr: CurrencyCode) => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentCurrency,
  onCurrencyChange,
}) => {
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { id: 'salary-calculator', label: 'Salary Calculator' },
    { id: 'budget-breakdown', label: 'Budget Breakdown' },
    { id: 'savings-goals', label: 'Savings Goals' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'settings', label: 'Settings' },
  ];

  const currencyObj = CURRENCIES[currentCurrency] || CURRENCIES.USD;

  return (
    <header className="fixed top-0 w-full z-50 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-[#bccac0]/25 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-16 max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Side: Logo and Navigation Links directly next to it */}
        <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
          {/* Logo and Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
            onClick={() => setActiveTab('salary-calculator')}
          >
            <img
              alt="Wealthora Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1X0p7kQoSBzW-wpxhXHZ5rs-siiKjHU4vEUjW6A-YvqbOlnGXSI1O7yHpy8geutjSMLY-3K5caSGxAVKMbz8a8YHdr23dTtOs5LFXm5XgfP8o5NIAnZdRy44MWu6_x_89Vtt1UCLtSvn9PfL5XRQJvhteYRyKQH-03PtJViPaET5n7tJ-aAYxMd1ZAkCb0tLrKpfpkH4V2BJzo9pCfAFIDlRsDBJhR9YJ6smK-KvFscAoTCt6PYG4W8UD4"
            />
            <span className="font-headline text-[17px] font-bold text-[#0b1c30] tracking-tight shrink-0 hidden sm:inline-block">
              Wealthora
            </span>
          </div>

          {/* Navigation Links situated right next to the logo in the header */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#00855d] text-[#f5fff7] shadow-xs'
                      : 'text-[#3d4a42] hover:bg-[#dce9ff]/60 hover:text-[#0b1c30]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Currency Switcher, Bell, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Currency Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center gap-1.5 bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-[#006948]/20 shadow-xs"
              type="button"
              title="Change active currency"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#85f8c4]/50 text-[#005137] text-[11px] font-bold">
                {currencyObj.symbol}
              </span>
              <span className="text-xs font-bold text-[#0b1c30]">
                {currencyObj.code}
              </span>
              <span className="px-1 py-0.5 rounded bg-[#006948]/10 text-[#006948] text-[10px] font-semibold hidden sm:inline-block">
                FX Live
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#3d4a42]">
                expand_more
              </span>
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#bccac0]/40 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#3d4a42]/70 border-b border-[#eff4ff]">
                  Select Base Currency
                </div>
                {Object.values(CURRENCIES).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      onCurrencyChange(c.code);
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs flex items-center justify-between hover:bg-[#eff4ff] transition-colors cursor-pointer ${
                      currentCurrency === c.code
                        ? 'font-bold text-[#006948] bg-[#eff4ff]/60'
                        : 'text-[#0b1c30]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#e5eeff] flex items-center justify-center font-bold text-[11px]">
                        {c.symbol}
                      </span>
                      <span>{c.code} - {c.name}</span>
                    </span>
                    {currentCurrency === c.code && (
                      <span className="material-symbols-outlined text-[16px] text-[#006948]">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications button with Popover */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-label="Notifications"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#3d4a42] hover:bg-[#dce9ff] hover:text-[#0b1c30] transition-colors relative cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                notifications
              </span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#006948]"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#bccac0]/40 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
                  <span className="text-xs font-bold text-[#0b1c30]">Recent Notifications</span>
                  <span className="text-[10px] text-[#006948] font-semibold bg-[#85f8c4]/30 px-1.5 py-0.5 rounded">All Synced</span>
                </div>
                <div className="flex flex-col gap-2 mt-2 max-h-60 overflow-y-auto">
                  <div className="p-2 rounded-lg bg-[#eff4ff] text-xs">
                    <p className="font-semibold text-[#0b1c30]">Chase Direct Deposit Detected</p>
                    <p className="text-[#3d4a42] text-[11px]">$6,500.00 verified and split into 50/30/20 buckets.</p>
                    <span className="text-[10px] text-[#3d4a42]/70">Today at 08:30 AM</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#f8f9ff] text-xs">
                    <p className="font-semibold text-[#0b1c30]">4.85% APY High-Yield Accrual</p>
                    <p className="text-[#3d4a42] text-[11px]">+$115.42 interest credited across 5 vaults.</p>
                    <span className="text-[10px] text-[#3d4a42]/70">Yesterday</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="flex items-center">
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#006948]/20"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkrLK6TzhuOa09sJ0Wc2vpLCEKtLIq9KCXsJv1SUgLuYxp2LbCO5Xbe4A15Jo6ACSryncZwV1JCOBB8KnR-2k2IkqpbpwyZ484l-6SFwVEjuVh4FK7YTw14a9DgPI1hp7aYMDYzuze_18nwEK6Wy9p1kdJVh4AfBvapth9ySZ1D8cdG7BP3V3fewbA1o5rZy9unEFgk4bG0XvxwZlMpfUmaXYqfXpU2K_qzqLw_HPcFxyXtPfaoYH3"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
