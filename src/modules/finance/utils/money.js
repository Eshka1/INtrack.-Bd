const DEFAULT_SUPPORTED_CURRENCIES = ['BDT', 'USD', 'EUR', 'GBP'];
const DEFAULT_NORMALIZATION_CURRENCY = 'BDT';

function roundMoney(value, decimals = 2) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function toMinorUnits(amount) {
  return Math.round(roundMoney(amount, 2) * 100);
}

function toMajorUnits(minorAmount) {
  if (typeof minorAmount !== 'number' || isNaN(minorAmount)) {
    return 0;
  }
  return roundMoney(minorAmount / 100, 2);
}

function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  const from = (fromCurrency || 'BDT').toUpperCase();
  const to = (toCurrency || 'BDT').toUpperCase();

  if (from === to) {
    return roundMoney(amount);
  }

  if (!rates || !rates[from] || !rates[to]) {
    throw new Error(`Missing exchange rate for conversion from ${from} to ${to}`);
  }

  const fromRate = rates[from];
  const toRate = rates[to];

  if (fromRate <= 0 || toRate <= 0) {
    throw new Error(`Invalid non-positive exchange rate encountered for ${from} or ${to}`);
  }

  const amountInBDT = amount / fromRate;
  const converted = amountInBDT * toRate;

  return roundMoney(converted);
}

function formatCurrency(amount, currency = 'BDT') {
  const code = (currency || 'BDT').toUpperCase();
  const symbols = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  const symbol = symbols[code] || `${code} `;
  const formattedNumber = roundMoney(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${symbol}${formattedNumber}`;
}

module.exports = {
  DEFAULT_SUPPORTED_CURRENCIES,
  DEFAULT_NORMALIZATION_CURRENCY,
  roundMoney,
  toMinorUnits,
  toMajorUnits,
  convertCurrency,
  formatCurrency
};
