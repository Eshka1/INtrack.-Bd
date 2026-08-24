const { Expenses, Order, BalanceSheet } = require('../models/Schemas');

// Dynamic Financial Calculation and Balance Sheet Generator [source: 1, 17]
const generateBalanceSheet = async (req, res) => {
  try {
    const { company_id } = req.user;

    const [expenseAggregate, orderAggregate] = await Promise.all([
      Expenses.aggregate([
        { $match: { company_id } },
        { $group: { _id: null, totalExpense: { $sum: '$money' } } }
      ]),
      Order.aggregate([
        { $match: { company_id, order_status: 'COMPLETED' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$calculated_selling_price' },
            totalCOGS: { $sum: '$calculated_cost' }
          }
        }
      ])
    ]);

    const totalExpenses = expenseAggregate[0]?.totalExpense || 0;
    const totalRevenue = orderAggregate[0]?.totalRevenue || 0;
    const totalCOGS = orderAggregate[0]?.totalCOGS || 0;
    const netBalance = totalRevenue - (totalExpenses + totalCOGS);

    const balanceRecord = await BalanceSheet.create({
      balance_id: `bal_${Date.now()}`,
      company_id,
      total_revenue: totalRevenue,
      total_cost_of_goods: totalCOGS,
      total_expenses: totalExpenses,
      net_balance: netBalance
    });

    res.status(200).json({
      success: true,
      data: {
        balance_id: balanceRecord.balance_id,
        company_id,
        date: balanceRecord.date,
        totalRevenue,
        costOfGoodsSold: totalCOGS,
        operationalExpenses: totalExpenses,
        netBalance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating balance sheet',
      error: error.message
    });
  }
};

module.exports = { generateBalanceSheet };