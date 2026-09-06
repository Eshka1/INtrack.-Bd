const payableRepo = require('../repositories/payableRepository');
const { getDisplayContext, displayFromNormalized } = require('./moneyPresentationService');

async function getAgingLedger(companyId, currency) {
  const [aging, display] = await Promise.all([payableRepo.getAgingLedgerAggregation(companyId), getDisplayContext(companyId, currency)]);
  return {
    ...aging,
    totalOutstanding: displayFromNormalized(aging.totalOutstanding, display),
    totalOverdue: displayFromNormalized(aging.totalOverdue, display),
    currency: display.displayCurrency,
    buckets: Object.fromEntries(Object.entries(aging.buckets).map(([key, value]) => [key, { ...value, totalOutstanding: displayFromNormalized(value.totalOutstanding, display) }]))
  };
}

module.exports = {
  getAgingLedger
};
