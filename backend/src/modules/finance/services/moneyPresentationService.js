const { getOrCreateCurrencySetting } = require('./currencyService');
const { convertCurrency } = require('../utils/money');

async function getDisplayContext(companyId, requestedCurrency) {
  const setting = await getOrCreateCurrencySetting(companyId);
  const rates = setting.exchangeRates instanceof Map ? Object.fromEntries(setting.exchangeRates) : setting.exchangeRates;
  const displayCurrency = (requestedCurrency || setting.displayCurrency || 'BDT').toUpperCase();
  if (!rates[displayCurrency]) throw new Error(`Unsupported display currency: ${displayCurrency}`);
  return { displayCurrency, rates };
}

function displayFromNormalized(normalizedAmount, context) {
  return convertCurrency(Number(normalizedAmount || 0), 'BDT', context.displayCurrency, context.rates);
}

function presentExpense(item, context) {
  const data = item.toObject ? item.toObject() : item;
  return { ...data, displayAmount: displayFromNormalized(data.normalizedAmount, context), displayCurrency: context.displayCurrency };
}

function presentBudget(item, context) {
  const data = item.toObject ? item.toObject() : item;
  return { ...data, displayMonthlyAmount: displayFromNormalized(data.normalizedMonthlyAmount, context), displayCurrency: context.displayCurrency };
}

function presentPayable(item, context) {
  const data = item.toObject ? item.toObject() : item;
  return {
    ...data,
    displayTotalAmount: displayFromNormalized(data.normalizedTotalAmount, context),
    displayPaidAmount: displayFromNormalized(data.normalizedPaidAmount, context),
    displayOutstandingAmount: displayFromNormalized(data.normalizedOutstandingAmount, context),
    displayCurrency: context.displayCurrency
  };
}

module.exports = { getDisplayContext, displayFromNormalized, presentExpense, presentBudget, presentPayable };
