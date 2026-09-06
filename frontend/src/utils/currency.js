export const currencySymbol = (currency = 'BDT') => ({ BDT: '৳', USD: '$', EUR: '€', GBP: '£' }[currency] || `${currency} `);

export const formatMoney = (amount, currency = 'BDT') => `${currencySymbol(currency)}${Number(amount || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})}`;
