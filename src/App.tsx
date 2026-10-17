/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CurrencyCode } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SalaryCalculator } from './components/SalaryCalculator';
import { BudgetBreakdown } from './components/BudgetBreakdown';
import { SavingsGoals } from './components/SavingsGoals';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { FXRoutesModal } from './components/FXRoutesModal';
import { Toast } from './components/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('salary-calculator');
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('USD');
  const [fxModalOpen, setFxModalOpen] = useState<boolean>(false);
  const [toastInfo, setToastInfo] = useState<{ message: string | null; icon: string }>({
    message: null,
    icon: 'check_circle',
  });

  const showToast = (message: string, icon: string = 'check_circle') => {
    setToastInfo({ message, icon });
  };

  const handleCurrencyChange = (newCurr: CurrencyCode) => {
    setCurrentCurrency(newCurr);
    showToast(`Base currency converted to ${newCurr}. FX live routes active.`, 'currency_exchange');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff] text-[#0b1c30]">
      {/* Fixed Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentCurrency={currentCurrency}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Main Content Area */}
      <main className="w-full flex-1 pt-20 px-4 sm:px-8 max-w-7xl mx-auto py-6">
        {activeTab === 'salary-calculator' && (
          <SalaryCalculator
            currentCurrency={currentCurrency}
            onCurrencyChange={handleCurrencyChange}
            onShowToast={showToast}
            onOpenFXRoutes={() => setFxModalOpen(true)}
          />
        )}

        {activeTab === 'budget-breakdown' && (
          <BudgetBreakdown
            currentCurrency={currentCurrency}
            onCurrencyChange={handleCurrencyChange}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'savings-goals' && (
          <SavingsGoals
            currentCurrency={currentCurrency}
            onCurrencyChange={handleCurrencyChange}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics
            currentCurrency={currentCurrency}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            currentCurrency={currentCurrency}
            onCurrencyChange={handleCurrencyChange}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Multi-Currency FX Routes Modal */}
      <FXRoutesModal
        isOpen={fxModalOpen}
        onClose={() => setFxModalOpen(false)}
        baseCurrency={currentCurrency}
        onSelectBaseCurrency={handleCurrencyChange}
        onShowToast={showToast}
      />

      {/* Floating System Toast */}
      <Toast
        message={toastInfo.message}
        icon={toastInfo.icon}
        onClose={() => setToastInfo({ message: null, icon: 'check_circle' })}
      />
    </div>
  );
}
