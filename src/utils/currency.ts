import { CurrencyCode } from '../types';
import { CURRENCIES } from '../data/initialData';

export function formatCurrency(
  amountInUSD: number,
  currencyCode: CurrencyCode,
  options?: {
    showCents?: boolean;
    compact?: boolean;
  }
): string {
  const currencyObj = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const rate = currencyObj.rateAgainstUSD;
  const converted = amountInUSD * rate;
  const showCents = options?.showCents !== undefined ? options.showCents : true;

  if (options?.compact && Math.abs(converted) >= 1000) {
    if (Math.abs(converted) >= 1000000) {
      return `${currencyObj.symbol}${(converted / 1000000).toFixed(1)}M`;
    }
    return `${currencyObj.symbol}${(converted / 1000).toFixed(1)}k`;
  }

  // JPY typically does not show cents
  const decimals = currencyCode === 'JPY' ? 0 : showCents ? 2 : 0;

  return `${currencyObj.symbol}${converted.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  return CURRENCIES[currencyCode]?.symbol || '$';
}

export function convertAmount(amountInUSD: number, currencyCode: CurrencyCode): number {
  const rate = CURRENCIES[currencyCode]?.rateAgainstUSD || 1.0;
  return amountInUSD * rate;
}
