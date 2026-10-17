import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  icon?: string;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, icon = 'check_circle', onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 max-w-sm p-4 rounded-xl bg-[#213145] text-[#eaf1ff] shadow-2xl flex items-center gap-3 transition-all duration-300 z-50 border border-[#bccac0]/20 animate-in slide-in-from-bottom-5">
      <span className="material-symbols-outlined text-[#85f8c4] text-[22px] flex-shrink-0">
        {icon}
      </span>
      <span className="text-xs font-medium leading-snug flex-1">
        {message}
      </span>
      <button
        onClick={onClose}
        className="text-[#bccac0] hover:text-white transition-colors cursor-pointer"
        type="button"
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  );
};
