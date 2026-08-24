const mongoose = require('mongoose');
const { Order, ClientRequirement, RawMaterial, AuditLog } = require('../models/Schemas');

// Process Manufacturing Run / Production Order with ACID Transaction Guarantee [source: 1, 2]
const processProductionOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { order_id, client_id, requirement_id, order_qty } = req.body;
    const { company_id, user_id, id } = req.user;

    // 1. Verify Recipe / Bill of Materials (BOM) [source: 1, 21]
    const requirement = await ClientRequirement.findOne({ requirement_id, company_id }).session(session);
    if (!requirement) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Product requirement recipe not found.' });
    }

    let calculatedCost = 0;
    let calculatedSellingPrice = 0;
    const stockDeductions = [];

    // 2. Validate stock availability for each raw material in the BOM
    for (const item of requirement.raw_materials_used) {
      const requiredAmount = item.consumption_per_unit * order_qty;
      const rawMat = await RawMaterial.findOne({ raw_id: item.raw_id, company_id }).session(session);

      if (!rawMat) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Raw material ID ${item.raw_id} in recipe does not exist in inventory.`
        });
      }

      if (rawMat.itemqty < requiredAmount) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${rawMat.raw_name}". Available: ${rawMat.itemqty} ${rawMat.unit}, Required: ${requiredAmount} ${rawMat.unit}.`
        });
      }

      calculatedCost += requiredAmount * rawMat.costprice;
      calculatedSellingPrice += requiredAmount * rawMat.sellingprice;
      stockDeductions.push({
        raw_id: item.raw_id,
        raw_name: rawMat.raw_name,
        deductQty: requiredAmount,
        previousQty: rawMat.itemqty
      });
    }

    // 3. Atomically deduct stock down to exact decimals [source: 1, 2]
    for (const d of stockDeductions) {
      await RawMaterial.updateOne(
        { raw_id: d.raw_id, company_id },
        { $inc: { itemqty: -d.deductQty } }
      ).session(session);
    }

    // 4. Create the completed production order [source: 11]
    const [order] = await Order.create(
      [
        {
          order_id,
          company_id,
          client_id,
          requirement_id,
          order_qty,
          order_status: 'COMPLETED',
          calculated_cost: calculatedCost,
          calculated_selling_price: calculatedSellingPrice
        }
      ],
      { session }
    );

    // 5. Append-only tamper-proof audit trail [source: 1, 2]
    await AuditLog.create(
      [
        {
          company_id,
          actor_id: user_id || id || 'SYSTEM',
          action: 'PRODUCTION_ORDER_PROCESSED',
          entity: 'Order',
          entity_id: order_id,
          diff: {
            stockDeductions,
            calculatedCost,
            calculatedSellingPrice
          }
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Production run successfully logged and stock balances updated.',
      data: order
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      success: false,
      message: 'Failed to process production run. Transaction aborted.',
      error: error.message
    });
  }
};

module.exports = { processProductionOrder };