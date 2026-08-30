const { CurrencySetting, DEFAULT_EXCHANGE_RATES } = require('../models/CurrencySetting');
const { convertCurrency, roundMoney } = require('../utils/money');

// TEMP DEBUG LOGS, delete after everything works
console.log("DEBUG CurrencySetting:", CurrencySetting);
console.log("DEBUG DEFAULT_EXCHANGE_RATES:", DEFAULT_EXCHANGE_RATES);

async function getOrCreateCurrencySetting(companyId) {
  // companyId is string like "cmp_test_alpha_01" (NOT mongo ObjectId)
  let setting = await CurrencySetting.findOne({ companyId });

  if (!setting) {
    setting = await CurrencySetting.create({
      companyId,
      baseCurrency: "BDT",
      exchangeRates: DEFAULT_EXCHANGE_RATES
    });
  }
  return setting;
}

async function updateCurrencySetting(companyId, payload) {
  const setting = await getOrCreateCurrencySetting(companyId);
  Object.assign(setting, payload);
  await setting.save();
  return setting;
}

async function getExchangeRate(companyId, targetCurrency) {
  const setting = await getOrCreateCurrencySetting(companyId);
  return setting.exchangeRates?.[targetCurrency] ?? 1;
}

module.exports = {
  getOrCreateCurrencySetting,
  updateCurrencySetting,
  getExchangeRate
};
