const mongoose = require('mongoose');
const Supplier = require('./models/Supplier');
const LocationStock = require('./models/LocationStock');
const Recipe = require('./models/Recipe');
const PurchaseOrder = require('./models/PurchaseOrder');

async function seedData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/INTrack_Module2');
    console.log('Connected to MongoDB for Module 2 seeding...');

    await Supplier.deleteMany({});
    await LocationStock.deleteMany({});
    await Recipe.deleteMany({});
    await PurchaseOrder.deleteMany({});

    // Seed Suppliers
    const supplier = await Supplier.create({
      companyId: 'comp_default',
      name: 'Apex Industrial Fabrics Ltd',
      contactPerson: 'Rafiqul Islam',
      contactEmail: 'rafiq@apexmaterials.com',
      contactPhone: '+8801711000000',
      leadTimeDays: 5,
      fulfillmentRate: 98,
      reliabilityRating: 4.8,
    });

    // Seed Stock
    await LocationStock.create([
      { companyId: 'comp_default', warehouseName: 'Main Warehouse', itemName: 'Raw Cotton Twill (Navy)', sku: 'RAW-COT-01', unitOfMeasure: 'meters', currentQuantity: 120.5, safetyStockThreshold: 30 },
      { companyId: 'comp_default', warehouseName: 'Main Warehouse', itemName: 'Poly Thread 500m Spool', sku: 'RAW-THR-02', unitOfMeasure: 'spools', currentQuantity: 8, safetyStockThreshold: 15 }, // Trigger low-stock flag
    ]);

    // Seed Recipe (BOM)
    await Recipe.create({
      companyId: 'comp_default',
      productName: 'Heavyweight Utility Jacket',
      productSku: 'FIN-JKT-001',
      batchYieldQuantity: 1,
      ingredients: [
        { itemName: 'Raw Cotton Twill (Navy)', sku: 'RAW-COT-01', consumptionPerPiece: 2.35, unitOfMeasure: 'meters' },
        { itemName: 'Poly Thread 500m Spool', sku: 'RAW-THR-02', consumptionPerPiece: 0.10, unitOfMeasure: 'spools' },
      ],
    });

    console.log('Module 2 standalone database initialized and seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedData();