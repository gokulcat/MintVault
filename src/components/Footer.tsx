import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-[#bccac0]/20 shadow-[0_-1px_6px_rgba(0,0,0,0.02)] mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[#3d4a42] text-xs font-medium">
          <span className="material-symbols-outlined text-[18px] text-[#006948]">
            lock
          </span>
          <span>256-bit Bank Grade Encryption Protected</span>
        </div>

        <div className="flex items-center gap-6 text-[#3d4a42] text-xs font-semibold">
          <a
            href="#security"
            onClick={(e) => { e.preventDefault(); alert("MintVault adheres to SOC2 Type II, ISO 27001, and 256-bit AES end-to-end payload encryption."); }}
            className="hover:text-[#0b1c30] transition-colors"
          >
            Security Overview
          </a>
          <a
            href="#compliance"
            onClick={(e) => { e.preventDefault(); alert("FDIC pass-through insurance eligible up to $2.5M via network partner banks. BSA/AML compliant."); }}
            className="hover:text-[#0b1c30] transition-colors"
          >
            Financial Compliance
          </a>
          <a
            href="#privacy"
            onClick={(e) => { e.preventDefault(); alert("Your financial telemetry and direct deposit credentials are zero-knowledge encrypted."); }}
            className="hover:text-[#0b1c30] transition-colors"
          >
            Terms &amp; Privacy
          </a>
        </div>

        <p className="text-xs text-[#3d4a42]">
          &copy; 2025 MintVault Technologies Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
