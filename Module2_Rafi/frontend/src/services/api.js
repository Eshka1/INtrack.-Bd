const API_BASE_URL = 'http://localhost:5002/api/v1/module2';

export const initialMockData = {
  suppliers: [
    {
      _id: 'sup_1',
      name: 'Apex Industrial Fabrics',
      contactPerson: 'Rafiqul Islam',
      contactEmail: 'rafiq@apexfabrics.com',
      contactPhone: '+880 1711-001122',
      leadTimeDays: 4,
      fulfillmentRate: 98.4,
      reliabilityRating: 4.9,
    },
    {
      _id: 'sup_2',
      name: 'Delta Polymers Ltd',
      contactPerson: 'Sarah Jenkins',
      contactEmail: 'orders@deltapoly.com',
      contactPhone: '+880 1819-445566',
      leadTimeDays: 8,
      fulfillmentRate: 91.2,
      reliabilityRating: 4.2,
    },
  ],
  inventory: [
    { _id: 'raw_1', itemName: 'Raw Cotton Twill (Navy)', sku: 'RAW-COT-01', unitOfMeasure: 'meters', currentQuantity: 145.5, safetyStockThreshold: 40.0 },
    { _id: 'raw_2', itemName: 'Poly Thread 500m Spool', sku: 'RAW-THR-02', unitOfMeasure: 'spools', currentQuantity: 6.0, safetyStockThreshold: 15.0 }, // Low Stock!
    { _id: 'raw_3', itemName: 'Brass Snap Buttons', sku: 'RAW-BTN-03', unitOfMeasure: 'pieces', currentQuantity: 28.0, safetyStockThreshold: 50.0 }, // Low Stock!
    { _id: 'raw_4', itemName: 'Organic Bamboo Viscose', sku: 'RAW-BAM-04', unitOfMeasure: 'meters', currentQuantity: 82.0, safetyStockThreshold: 20.0 },
  ],
  recipes: [
    {
      _id: 'rec_1',
      productName: 'Heavyweight Utility Jacket',
      productSku: 'FIN-JKT-001',
      batchYieldQuantity: 1,
      ingredients: [
        { itemName: 'Raw Cotton Twill (Navy)', sku: 'RAW-COT-01', consumptionPerPiece: 2.35, unitOfMeasure: 'meters' },
        { itemName: 'Poly Thread 500m Spool', sku: 'RAW-THR-02', consumptionPerPiece: 0.15, unitOfMeasure: 'spools' },
        { itemName: 'Brass Snap Buttons', sku: 'RAW-BTN-03', consumptionPerPiece: 6.0, unitOfMeasure: 'pieces' },
      ],
    },
  ],
  purchaseOrders: [
    {
      _id: 'po_101',
      poNumber: 'PO-2026-0089',
      supplierName: 'Delta Polymers Ltd',
      warehouseName: 'Main Warehouse B',
      status: 'PENDING',
      totalCost: 1420.0,
      items: [
        { name: 'Poly Thread 500m Spool', sku: 'RAW-THR-02', orderedQuantity: 40, unitCost: 4.5, unitOfMeasure: 'spools' },
        { name: 'Brass Snap Buttons', sku: 'RAW-BTN-03', orderedQuantity: 200, unitCost: 0.45, unitOfMeasure: 'pieces' },
      ],
    },
  ],
};