const { registerCompany, authHeader, app, request } = require('./helpers');
const { Expense } = require('../src/modules/finance/models/Expense');
const { AccountPayable } = require('../src/modules/finance/models/AccountPayable');

async function createSupplier(token, name = 'Apex Textiles') {
  return request(app).post('/api/module2/suppliers').set(authHeader(token)).send({
    name,
    contactEmail: 'supply@example.test',
    products: [{ name: 'Cotton Yarn', sku: 'YARN-001', unit: 'kg', unitPrice: 5 }]
  });
}

async function createWarehouse(token, name = `Warehouse-${Math.random().toString(36).slice(2, 7)}`, parentLocation) {
  return request(app).post('/api/warehouses').set(authHeader(token)).send({ name, locationType: parentLocation ? 'shelf' : 'building', parentLocation });
}

async function receiveStock(token, supplierId, warehouseId, quantity = 10) {
  const po = await request(app).post('/api/module2/purchase-orders').set(authHeader(token)).send({
    poNumber: `PO-${Math.random().toString(36).slice(2, 8)}`,
    supplierId,
    warehouseId,
    items: [{ itemName: 'Cotton Yarn', sku: 'YARN-001', orderedQuantity: quantity, unitCost: 5, unitOfMeasure: 'kg' }]
  });
  expect(po.status).toBe(201);
  const received = await request(app).post(`/api/module2/purchase-orders/${po.body.data._id}/ingest`).set(authHeader(token)).send({
    receiptReference: `receipt-${Math.random().toString(36).slice(2)}`,
    deliverySlipNumber: 'DS-001',
    receivedItems: [{ sku: 'YARN-001', quantity }]
  });
  expect(received.status).toBe(200);
  return { po: po.body.data, receipt: received.body.data };
}

describe('Module 2 integration', () => {
  test('requires authentication', async () => {
    const response = await request(app).get('/api/module2/suppliers');
    expect(response.status).toBe(401);
  });

  test('isolates suppliers and inventory by tenant', async () => {
    const first = await registerCompany();
    const second = await registerCompany();
    const supplier = await createSupplier(first.token);
    const warehouse = await createWarehouse(first.token);
    expect(supplier.status).toBe(201);
    await receiveStock(first.token, supplier.body.data._id, warehouse.body.data._id, 12.5);

    const firstInventory = await request(app).get('/api/module2/inventory/alerts').set(authHeader(first.token));
    const secondInventory = await request(app).get('/api/module2/inventory/alerts').set(authHeader(second.token));
    const secondSuppliers = await request(app).get('/api/module2/suppliers').set(authHeader(second.token));

    expect(firstInventory.body.inventory).toHaveLength(1);
    expect(firstInventory.body.inventory[0].currentQuantity).toBe(12.5);
    expect(secondInventory.body.inventory).toHaveLength(0);
    expect(secondSuppliers.body.data).toHaveLength(0);
  });

  test('creates recipes and completes a manufacturing run with decimal deduction', async () => {
    const tenant = await registerCompany();
    const supplier = await createSupplier(tenant.token);
    const warehouse = await createWarehouse(tenant.token);
    await receiveStock(tenant.token, supplier.body.data._id, warehouse.body.data._id, 10);
    const recipe = await request(app).post('/api/module2/recipes').set(authHeader(tenant.token)).send({
      productName: 'Fabric Roll', productSku: 'FAB-001', batchYieldQuantity: 1,
      ingredients: [{ itemName: 'Cotton Yarn', sku: 'YARN-001', consumptionPerPiece: 0.25, unitOfMeasure: 'kg' }]
    });
    expect(recipe.status).toBe(201);

    const run = await request(app).post('/api/module2/manufacturing/run').set(authHeader(tenant.token)).send({
      recipeId: recipe.body.data._id, warehouseId: warehouse.body.data._id, quantityProduced: 4
    });
    expect(run.status).toBe(201);

    const inventory = await request(app).get('/api/module2/inventory/alerts').set(authHeader(tenant.token));
    expect(inventory.body.inventory[0].currentQuantity).toBe(9);
  });

  test('insufficient stock rejects the run without changing inventory', async () => {
    const tenant = await registerCompany();
    const supplier = await createSupplier(tenant.token);
    const warehouse = await createWarehouse(tenant.token);
    await receiveStock(tenant.token, supplier.body.data._id, warehouse.body.data._id, 2);
    const recipe = await request(app).post('/api/module2/recipes').set(authHeader(tenant.token)).send({
      productName: 'Heavy Fabric', productSku: 'HEAVY-001',
      ingredients: [{ itemName: 'Cotton Yarn', sku: 'YARN-001', consumptionPerPiece: 3, unitOfMeasure: 'kg' }]
    });

    const run = await request(app).post('/api/module2/manufacturing/run').set(authHeader(tenant.token)).send({
      recipeId: recipe.body.data._id, warehouseId: warehouse.body.data._id, quantityProduced: 1
    });
    expect(run.status).toBe(400);

    const inventory = await request(app).get('/api/module2/inventory/alerts').set(authHeader(tenant.token));
    expect(inventory.body.inventory[0].currentQuantity).toBe(2);
  });

  test('rejects cross-tenant and inactive storage destinations', async () => {
    const first = await registerCompany();
    const second = await registerCompany();
    const supplier = await createSupplier(first.token);
    const otherWarehouse = await createWarehouse(second.token, 'Other Tenant Warehouse');

    const crossTenant = await request(app).post('/api/module2/purchase-orders').set(authHeader(first.token)).send({
      poNumber: 'PO-CROSS-TENANT', supplierId: supplier.body.data._id, warehouseId: otherWarehouse.body.data._id,
      warehouseName: 'Spoofed Name', items: [{ itemName: 'Cotton Yarn', sku: 'YARN-001', orderedQuantity: 1, unitCost: 5, unitOfMeasure: 'kg' }]
    });
    expect(crossTenant.status).toBe(404);

    const ownWarehouse = await createWarehouse(first.token, 'Inactive Warehouse');
    await request(app).delete(`/api/warehouses/${ownWarehouse.body.data._id}`).set(authHeader(first.token));
    const inactive = await request(app).post('/api/module2/purchase-orders').set(authHeader(first.token)).send({
      poNumber: 'PO-INACTIVE', supplierId: supplier.body.data._id, warehouseId: ownWarehouse.body.data._id,
      items: [{ itemName: 'Cotton Yarn', sku: 'YARN-001', orderedQuantity: 1, unitCost: 5, unitOfMeasure: 'kg' }]
    });
    expect(inactive.status).toBe(404);

    const malformed = await request(app).post('/api/module2/purchase-orders').set(authHeader(first.token)).send({
      poNumber: 'PO-MALFORMED', supplierId: supplier.body.data._id, warehouseId: 'not-an-object-id',
      items: [{ itemName: 'Cotton Yarn', sku: 'YARN-001', orderedQuantity: 1, unitCost: 5, unitOfMeasure: 'kg' }]
    });
    expect(malformed.status).toBe(400);
  });

  test('keeps the same SKU isolated across warehouse locations and trusts the referenced name', async () => {
    const tenant = await registerCompany();
    const supplier = await createSupplier(tenant.token);
    const building = await createWarehouse(tenant.token, 'Main Site');
    const shelf = await createWarehouse(tenant.token, 'Shelf A', building.body.data._id);

    await receiveStock(tenant.token, supplier.body.data._id, building.body.data._id, 3.5);
    await receiveStock(tenant.token, supplier.body.data._id, shelf.body.data._id, 7.25);
    const inventory = await request(app).get('/api/module2/inventory/alerts').set(authHeader(tenant.token));

    expect(inventory.body.inventory).toHaveLength(2);
    expect(inventory.body.inventory.find((item) => item.warehouse._id === building.body.data._id).currentQuantity).toBe(3.5);
    expect(inventory.body.inventory.find((item) => item.warehouse._id === shelf.body.data._id).currentQuantity).toBe(7.25);
    expect(inventory.body.inventory.map((item) => item.warehouseName).sort()).toEqual(['Main Site', 'Shelf A']);

    const recipe = await request(app).post('/api/module2/recipes').set(authHeader(tenant.token)).send({
      productName: 'Location-bound Product', productSku: 'LOC-001',
      ingredients: [{ itemName: 'Cotton Yarn', sku: 'YARN-001', consumptionPerPiece: 5, unitOfMeasure: 'kg' }]
    });
    const run = await request(app).post('/api/module2/manufacturing/run').set(authHeader(tenant.token)).send({
      recipeId: recipe.body.data._id, warehouseId: building.body.data._id, quantityProduced: 1
    });
    expect(run.status).toBe(400);

    const unchanged = await request(app).get('/api/module2/inventory/alerts').set(authHeader(tenant.token));
    expect(unchanged.body.inventory.find((item) => item.warehouse._id === building.body.data._id).currentQuantity).toBe(3.5);
    expect(unchanged.body.inventory.find((item) => item.warehouse._id === shelf.body.data._id).currentQuantity).toBe(7.25);
  });

  test('creates proportional finance records and makes receipt retries idempotent', async () => {
    const tenant = await registerCompany();
    await request(app).put('/api/finance/currency').set(authHeader(tenant.token)).send({
      displayCurrency: 'USD', exchangeRates: { USD: 0.01, EUR: 0.009, GBP: 0.008 }
    });
    const supplier = await createSupplier(tenant.token, 'Finance Supplier');
    expect(supplier.body.data.products[0].currency).toBe('USD');
    const warehouse = await createWarehouse(tenant.token, 'Finance Warehouse');
    const po = await request(app).post('/api/module2/purchase-orders').set(authHeader(tenant.token)).send({
      poNumber: 'PO-FINANCE', supplierId: supplier.body.data._id, warehouseId: warehouse.body.data._id, currency: 'USD',
      items: [{ itemName: 'Cotton Yarn', sku: 'YARN-001', orderedQuantity: 10, unitCost: 5, unitOfMeasure: 'kg' }]
    });
    const firstPayload = { receiptReference: 'receipt-finance-1', receivedItems: [{ sku: 'YARN-001', quantity: 4 }] };
    const first = await request(app).post(`/api/module2/purchase-orders/${po.body.data._id}/ingest`).set(authHeader(tenant.token)).send(firstPayload);
    expect(first.status).toBe(200);
    expect(first.body.data.status).toBe('PARTIAL');
    const duplicate = await request(app).post(`/api/module2/purchase-orders/${po.body.data._id}/ingest`).set(authHeader(tenant.token)).send(firstPayload);
    expect(duplicate.body.duplicate).toBe(true);
    await request(app).post(`/api/module2/purchase-orders/${po.body.data._id}/ingest`).set(authHeader(tenant.token)).send({
      receiptReference: 'receipt-finance-2', receivedItems: [{ sku: 'YARN-001', quantity: 6 }]
    });
    const expenses = await Expense.find({ companyId: tenant.tenantId, sourceType: 'module2-po-receipt' }).sort({ amount: 1 });
    expect(expenses.map((expense) => expense.amount)).toEqual([20, 30]);
    expect(expenses.map((expense) => expense.normalizedAmount)).toEqual([2000, 3000]);
    const payable = await AccountPayable.findOne({ companyId: tenant.tenantId, purchaseOrderId: String(po.body.data._id) });
    expect(payable.totalAmount).toBe(50);
    expect(payable.normalizedOutstandingAmount).toBe(5000);
    const inventory = await request(app).get('/api/module2/inventory/alerts').set(authHeader(tenant.token));
    expect(inventory.body.inventory[0].currentQuantity).toBe(10);
    const dashboard = await request(app).get('/api/finance/dashboard').set(authHeader(tenant.token));
    expect(dashboard.body.data.monthlyExpense).toBe(50);
    expect(dashboard.body.data.outstandingPayable).toBe(50);
  });
});
