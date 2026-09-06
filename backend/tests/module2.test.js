const { registerCompany, authHeader, app, request } = require('./helpers');

async function createSupplier(token, name = 'Apex Textiles') {
  return request(app).post('/api/module2/suppliers').set(authHeader(token)).send({
    name,
    contactEmail: 'supply@example.test',
    products: [{ name: 'Cotton Yarn', sku: 'YARN-001', unit: 'kg', unitPrice: 5 }]
  });
}

async function receiveStock(token, supplierId, quantity = 10) {
  const po = await request(app).post('/api/module2/purchase-orders').set(authHeader(token)).send({
    poNumber: `PO-${Math.random().toString(36).slice(2, 8)}`,
    supplierId,
    warehouseName: 'Main Warehouse',
    items: [{ itemName: 'Cotton Yarn', sku: 'YARN-001', orderedQuantity: quantity, unitCost: 5, unitOfMeasure: 'kg' }]
  });
  expect(po.status).toBe(201);
  const received = await request(app).post(`/api/module2/purchase-orders/${po.body.data._id}/ingest`).set(authHeader(token)).send({
    deliverySlipNumber: 'DS-001',
    receivedItems: [{ sku: 'YARN-001', quantity }]
  });
  expect(received.status).toBe(200);
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
    expect(supplier.status).toBe(201);
    await receiveStock(first.token, supplier.body.data._id, 12.5);

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
    await receiveStock(tenant.token, supplier.body.data._id, 10);
    const recipe = await request(app).post('/api/module2/recipes').set(authHeader(tenant.token)).send({
      productName: 'Fabric Roll', productSku: 'FAB-001', batchYieldQuantity: 1,
      ingredients: [{ itemName: 'Cotton Yarn', sku: 'YARN-001', consumptionPerPiece: 0.25, unitOfMeasure: 'kg' }]
    });
    expect(recipe.status).toBe(201);

    const run = await request(app).post('/api/module2/manufacturing/run').set(authHeader(tenant.token)).send({
      recipeId: recipe.body.data._id, warehouseName: 'Main Warehouse', quantityProduced: 4
    });
    expect(run.status).toBe(201);

    const inventory = await request(app).get('/api/module2/inventory/alerts').set(authHeader(tenant.token));
    expect(inventory.body.inventory[0].currentQuantity).toBe(9);
  });

  test('insufficient stock rejects the run without changing inventory', async () => {
    const tenant = await registerCompany();
    const supplier = await createSupplier(tenant.token);
    await receiveStock(tenant.token, supplier.body.data._id, 2);
    const recipe = await request(app).post('/api/module2/recipes').set(authHeader(tenant.token)).send({
      productName: 'Heavy Fabric', productSku: 'HEAVY-001',
      ingredients: [{ itemName: 'Cotton Yarn', sku: 'YARN-001', consumptionPerPiece: 3, unitOfMeasure: 'kg' }]
    });

    const run = await request(app).post('/api/module2/manufacturing/run').set(authHeader(tenant.token)).send({
      recipeId: recipe.body.data._id, warehouseName: 'Main Warehouse', quantityProduced: 1
    });
    expect(run.status).toBe(400);

    const inventory = await request(app).get('/api/module2/inventory/alerts').set(authHeader(tenant.token));
    expect(inventory.body.inventory[0].currentQuantity).toBe(2);
  });
});
