const { Inventory, RawMaterial, AuditLog } = require('../models/Schemas');

// 1. Create a dynamic category/field (e.g., Packaging, Chemicals) [source: 1, 14]
const createInventoryCategory = async (req, res) => {
  try {
    const { inventory_id, field, materials } = req.body;
    const company_id = req.user.company_id;

    const existingCategory = await Inventory.findOne({ inventory_id, company_id });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category ID already exists.' });
    }

    const category = await Inventory.create({
      inventory_id,
      company_id,
      field,
      materials: materials || []
    });

    await AuditLog.create({
      company_id,
      actor_id: req.user.user_id || req.user.id || 'UNKNOWN',
      action: 'CREATE_INVENTORY_CATEGORY',
      entity: 'Inventory',
      entity_id: inventory_id,
      diff: category
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating category', error: error.message });
  }
};

// 2. Create and register a new Raw Material [source: 9]
const createRawMaterial = async (req, res) => {
  try {
    const {
      raw_id,
      inventory_id,
      raw_name,
      itemqty,
      unit,
      costprice,
      sellingprice,
      safety_threshold
    } = req.body;
    const company_id = req.user.company_id;

    // Verify parent category exists for this tenant
    const category = await Inventory.findOne({ inventory_id, company_id });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Parent inventory category not found.' });
    }

    const rawMaterial = await RawMaterial.create({
      raw_id,
      company_id,
      inventory_id,
      raw_name,
      itemqty: itemqty || 0,
      unit: unit || 'pieces',
      costprice,
      sellingprice,
      safety_threshold: safety_threshold || 10
    });

    // Append to parent inventory materials list
    await Inventory.updateOne(
      { inventory_id, company_id },
      { $addToSet: { materials: raw_id } }
    );

    await AuditLog.create({
      company_id,
      actor_id: req.user.user_id || req.user.id || 'UNKNOWN',
      action: 'CREATE_RAW_MATERIAL',
      entity: 'RawMaterial',
      entity_id: raw_id,
      diff: rawMaterial
    });

    res.status(201).json({ success: true, data: rawMaterial });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating raw material', error: error.message });
  }
};

// 3. Get Full Inventory Overview with Nested Items
const getInventoryOverview = async (req, res) => {
  try {
    const { company_id } = req.user;

    const inventory = await Inventory.aggregate([
      { $match: { company_id } },
      {
        $lookup: {
          from: 'raw_materials',
          let: { compId: '$company_id', invId: '$inventory_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$company_id', '$$compId'] },
                    { $eq: ['$inventory_id', '$$invId'] }
                  ]
                }
              }
            }
          ],
          as: 'raw_materials'
        }
      }
    ]);

    res.status(200).json({ success: true, count: inventory.length, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching inventory', error: error.message });
  }
};

module.exports = {
  createInventoryCategory,
  createRawMaterial,
  getInventoryOverview
};