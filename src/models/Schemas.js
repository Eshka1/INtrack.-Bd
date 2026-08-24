const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. SuperAdmin Model (maps to super_admin.py)
const superAdminSchema = new mongoose.Schema({
  superadmin_id: { type: String, required: true, unique: true },
  uname: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

superAdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema, 'super_admins');

// 2. Subscription Model (maps to subscription.py)
const subscriptionSchema = new mongoose.Schema({
  subscription_id: { type: String, required: true, unique: true },
  plan_name: { type: String, required: true, enum: ['Free', 'Standard', 'Premium'] },
  start_date: { type: String, required: true },
  monthly_price: { type: Number, required: true },
  yearly_price: { type: Number, required: true },
  limits: {
    maxUsers: { type: Number, default: 5 },
    maxRawMaterials: { type: Number, default: 50 },
    maxOrders: { type: Number, default: 250 }
  }
}, { timestamps: true });
const Subscription = mongoose.model('Subscription', subscriptionSchema, 'subscriptions');

// 3. Company Model (maps to company.py)
const companySchema = new mongoose.Schema({
  company_id: { type: String, required: true, unique: true, index: true },
  company_name: { type: String, required: true },
  uid: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscription_id: { type: String, required: true, ref: 'Subscription' },
  currency: { type: String, default: 'USD' }
}, { timestamps: true });

companySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const Company = mongoose.model('Company', companySchema, 'companies');

// 4. Owner Model (maps to owner.py)
const ownerSchema = new mongoose.Schema({
  owner_id: { type: String, required: true, unique: true },
  company_id: { type: String, required: true, index: true },
  owner_name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}, { timestamps: true });
const Owner = mongoose.model('Owner', ownerSchema, 'owners');

// 5. Manager Model (maps to manager.py)
const managerSchema = new mongoose.Schema({
  manager_id: { type: String, required: true },
  company_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role_id: { type: String, ref: 'Role' }
}, { timestamps: true });

managerSchema.index({ email: 1, company_id: 1 }, { unique: true });
managerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const Manager = mongoose.model('Manager', managerSchema, 'managers');

// 6. Role Model (maps to role.py)
const roleSchema = new mongoose.Schema({
  role_id: { type: String, required: true },
  company_id: { type: String, required: true, index: true },
  role_name: { type: String, required: true },
  permissions: [{
    module: { type: String, required: true }, // 'inventory', 'orders', 'finance', 'clients'
    actions: [{ type: String, enum: ['create', 'read', 'update', 'delete', 'export'] }]
  }]
}, { timestamps: true });

roleSchema.index({ role_id: 1, company_id: 1 }, { unique: true });
const Role = mongoose.model('Role', roleSchema, 'roles');

// 7. Inventory Category Model (maps to inventory.py)
const inventorySchema = new mongoose.Schema({
  inventory_id: { type: String, required: true },
  company_id: { type: String, required: true, index: true },
  field: { type: String, required: true },
  materials: { type: [String], default: [] }
}, { timestamps: true });

inventorySchema.index({ inventory_id: 1, company_id: 1 }, { unique: true });
const Inventory = mongoose.model('Inventory', inventorySchema, 'inventories');

// 8. Raw Material Model (maps to raw_material.py)
const rawMaterialSchema = new mongoose.Schema({
  raw_id: { type: String, required: true },
  company_id: { type: String, required: true, index: true },
  inventory_id: { type: String, required: true, index: true },
  raw_name: { type: String, required: true },
  itemqty: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'pieces' },
  costprice: { type: Number, required: true },
  sellingprice: { type: Number, required: true },
  safety_threshold: { type: Number, default: 10 }
}, { timestamps: true });

rawMaterialSchema.index({ raw_id: 1, company_id: 1 }, { unique: true });
const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema, 'raw_materials');

// 9. Client Model (maps to client.py)
const clientSchema = new mongoose.Schema({
  id: { type: String, required: true },
  company_id: { type: String, required: true, index: true },
  name: { type: String, required: true }
}, { timestamps: true });

clientSchema.index({ id: 1, company_id: 1 }, { unique: true });
const Client = mongoose.model('Client', clientSchema, 'clients');

// 10. Client Requirement Model (maps to client_requirement.py)
const clientRequirementSchema = new mongoose.Schema({
  requirement_id: { type: String, required: true },
  company_id: { type: String, required: true, index: true },
  client_id: { type: String, required: true },
  product_name: { type: String, required: true },
  per_piece_req: { type: Number, required: true },
  raw_materials_used: [{
    raw_id: { type: String, required: true },
    consumption_per_unit: { type: Number, required: true }
  }]
}, { timestamps: true });

clientRequirementSchema.index({ requirement_id: 1, company_id: 1 }, { unique: true });
const ClientRequirement = mongoose.model('ClientRequirement', clientRequirementSchema, 'client_requirements');

// 11. Order Model (maps to order.py)
const orderSchema = new mongoose.Schema({
  order_id: { type: String, required: true },
  company_id: { type: String, required: true, index: true },
  order_date: { type: String, default: () => new Date().toISOString() },
  order_status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  client_id: { type: String, required: true },
  requirement_id: { type: String, required: true },
  order_qty: { type: Number, required: true },
  calculated_cost: { type: Number, default: 0 },
  calculated_selling_price: { type: Number, default: 0 }
}, { timestamps: true });

orderSchema.index({ order_id: 1, company_id: 1 }, { unique: true });
const Order = mongoose.model('Order', orderSchema, 'orders');

// 12. Expenses Model (maps to expenses.py)
const expenseSchema = new mongoose.Schema({
  expense_id: { type: String, required: true },
  company_id: { type: String, required: true, index: true },
  expense_name: { type: String, required: true },
  money: { type: Number, required: true },
  category: { type: String, default: 'Operational' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

expenseSchema.index({ expense_id: 1, company_id: 1 }, { unique: true });
const Expenses = mongoose.model('Expenses', expenseSchema, 'expenses');

// 13. BalanceSheet Model (maps to balance_sheet.py)
const balanceSheetSchema = new mongoose.Schema({
  balance_id: { type: String, required: true },
  company_id: { type: String, required: true, index: true },
  date: { type: Date, default: Date.now },
  total_revenue: { type: Number, default: 0 },
  total_cost_of_goods: { type: Number, default: 0 },
  total_expenses: { type: Number, default: 0 },
  net_balance: { type: Number, default: 0 }
}, { timestamps: true });

const BalanceSheet = mongoose.model('BalanceSheet', balanceSheetSchema, 'balance_sheets');

// 14. Report Model (maps to report.py)
const reportSchema = new mongoose.Schema({
  report_id: { type: String, required: true },
  company_id: { type: String, required: true, index: true },
  report_type: { type: String, default: 'INVENTORY_VALUATION' },
  generated_at: { type: Date, default: Date.now },
  file_url: { type: String }
}, { timestamps: true });
const Report = mongoose.model('Report', reportSchema, 'reports');

// 15. Dashboard Model (maps to dashboard.py)
const dashboardSchema = new mongoose.Schema({
  dashboard_id: { type: String, required: true },
  company_id: { type: String, required: true, index: true },
  view: { type: String, default: 'DEFAULT_ANALYTICS' },
  layout_config: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
const Dashboard = mongoose.model('Dashboard', dashboardSchema, 'dashboards');

// 16. Audit Log Model
const auditLogSchema = new mongoose.Schema({
  company_id: { type: String, required: true, index: true },
  actor_id: { type: String, required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entity_id: { type: String, required: true },
  diff: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});
const AuditLog = mongoose.model('AuditLog', auditLogSchema, 'audit_logs');

module.exports = {
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
};