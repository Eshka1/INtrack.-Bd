const mongoose = require('mongoose');

const currencySettingSchema = new mongoose.Schema({
  companyId: {
    type: String,
    required: true,
    index: true
  },
  baseCurrency: {
    type: String,
    default: "BDT"
  },
  exchangeRates: {
    type: Object,
    default: {}
  }
});

const CurrencySetting = mongoose.model('CurrencySetting', currencySettingSchema);

const DEFAULT_EXCHANGE_RATES = {
  BDT: 1,
  USD: 0.0084,
  EUR: 0.0078
};

module.exports = { CurrencySetting, DEFAULT_EXCHANGE_RATES };
