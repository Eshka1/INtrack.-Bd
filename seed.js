require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const {
  SuperAdmin,
  Subscription,
  Company,
  Owner,
  Manager,
  Role,
  Inventory,
  RawMaterial,
  Client,
  ClientRequirement,
  Order,
  Expenses,
  BalanceSheet,
  Report,
  Dashboard,
  AuditLog
} = require('./src/models/Schemas.js');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/INTrackDB';
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('Connected to MongoDB. Seeding IN-Track initial multi-tenant dataset...');

    // 1. Clear all existing collections
    await Promise.all([
      SuperAdmin.deleteMany({}),
      Subscription.deleteMany({}),
      Company.deleteMany({}),
      Owner.deleteMany({}),
      Manager.deleteMany({}),
      Role.deleteMany({}),
      Inventory.deleteMany({}),
      RawMaterial.deleteMany({}),
      Client.deleteMany({}),
      ClientRequirement.deleteMany({}),
      Order.deleteMany({}),
      Expenses.deleteMany({}),
      BalanceSheet.deleteMany({}),
      Report.deleteMany({}),
      Dashboard.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    // 2. SuperAdmin
    const hashedSuperAdminPass = await bcrypt.hash('admin123', 12);
    await SuperAdmin.create({
      superadmin_id: 'sa_001',
      uname: 'superadmin',
      password: hashedSuperAdminPass
    });

    // 3. Subscriptions
    await Subscription.create([
      {
        subscription_id: 'sub_free',
        plan_name: 'Free',
        start_date: '2026-01-01',
        monthly_price: 0,
        yearly_price: 0,
        limits: { maxUsers: 2, maxRawMaterials: 10, maxOrders: 50 }
      },
      {
        subscription_id: 'sub001',
        plan_name: 'Premium',
        start_date: '2026-01-01',
        monthly_price: 50,
        yearly_price: 500,
        limits: { maxUsers: 50, maxRawMaterials: 1000, maxOrders: 5000 }
      }
    ]);

    // 4. Client Company (Tenant)
    const hashedCompanyPass = await bcrypt.hash('1234', 12);
    await Company.create({
      company_id: '001',
      company_name: 'ABC Ltd',
      uid: 'abc',
      password: hashedCompanyPass,
      subscription_id: 'sub001',
      currency: 'USD'
    });

    // 5. Roles & Permissions
    await Role.create([
      {
        role_id: 'role_owner',
        company_id: '001',
        role_name: 'Corporate Owner',
        permissions: [
          { module: 'inventory', actions: ['create', 'read', 'update', 'delete', 'export'] },
          { module: 'orders', actions: ['create', 'read', 'update', 'delete', 'export'] },
          { module: 'finance', actions: ['create', 'read', 'update', 'delete', 'export'] },
          { module: 'clients', actions: ['create', 'read', 'update', 'delete', 'export'] }
        ]
      },
      {
        role_id: 'role_manager',
        company_id: '001',
        role_name: 'Warehouse Manager',
        permissions: [
          { module: 'inventory', actions: ['create', 'read', 'update', 'export'] },
          { module: 'orders', actions: ['create', 'read', 'update'] },
          { module: 'finance', actions: ['read', 'export'] },
          { module: 'clients', actions: ['read'] }
        ]
      }
    ]);

    // 6. Owner & Manager Accounts
    await Owner.create({
      owner_id: 'own_001',
      company_id: '001',
      owner_name: 'Tashfia Monir',
      email: 'owner@abcltd.com'
    });

    const hashedManagerPass = await bcrypt.hash('manager123', 12);
    await Manager.create({
      manager_id: 'mgr_001',
      company_id: '001',
      name: 'Alimul Rafi',
      email: 'manager@abcltd.com',
      password: hashedManagerPass,
      role_id: 'role_manager'
    });

    // 7. Inventory Category & Raw Materials
    await Inventory.create({
      inventory_id: 'inv_pkg_001',
      company_id: '001',
      field: 'Packaging Materials',
      materials: ['raw_box_01', 'raw_tape_01']
    });

    await RawMaterial.create([
      {
        raw_id: 'raw_box_01',
        company_id: '001',
        inventory_id: 'inv_pkg_001',
        raw_name: 'Corrugated Shipping Box (Large)',
        itemqty: 2500,
        unit: 'pieces',
        costprice: 0.85,
        sellingprice: 1.50,
        safety_threshold: 200
      },
      {
        raw_id: 'raw_tape_01',
        company_id: '001',
        inventory_id: 'inv_pkg_001',
        raw_name: 'Heavy Duty Packaging Tape',
        itemqty: 400,
        unit: 'meters',
        costprice: 0.15,
        sellingprice: 0.35,
        safety_threshold: 50
      }
    ]);

    // 8. Client & Bill of Materials (BOM) Recipe
    await Client.create({
      id: 'client_001',
      company_id: '001',
      name: 'Apex Global Logistics'
    });

    await ClientRequirement.create({
      requirement_id: 'req_box_pack_01',
      company_id: '001',
      client_id: 'client_001',
      product_name: 'Standard Packing Unit',
      per_piece_req: 1.0,
      raw_materials_used: [
        { raw_id: 'raw_box_01', consumption_per_unit: 1 },
        { raw_id: 'raw_tape_01', consumption_per_unit: 2.0 }
      ]
    });

    // 9. Operational Expenses
    await Expenses.create([
      {
        expense_id: 'exp_001',
        company_id: '001',
        expense_name: 'Warehouse Electricity & Utilities',
        money: 450.00,
        category: 'Utilities'
      },
      {
        expense_id: 'exp_002',
        company_id: '001',
        expense_name: 'Forklift Maintenance & Fuel',
        money: 200.00,
        category: 'Maintenance'
      }
    ]);

    // 10. Dashboard Layout & Report
    await Dashboard.create({
      dashboard_id: 'dash_001',
      company_id: '001',
      view: 'ANALYTICS_OVERVIEW',
      layout_config: {
        showLowStockAlerts: true,
        showExpenseChart: true,
        showMonthlyProfit: true
      }
    });

    await Report.create({
      report_id: 'rep_001',
      company_id: '001',
      report_type: 'INITIAL_STOCK_VALUATION',
      file_url: '/reports/initial-stock.pdf'
    });

    console.log('Database successfully seeded with multi-tenant starter data.');
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();