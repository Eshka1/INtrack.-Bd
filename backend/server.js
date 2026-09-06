const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/INTrack_Module2';

// --- CORS & BODY PARSER ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// --- MONGOOSE SCHEMAS & MODELS ---
const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  currentBalance: { type: Number, default: 0 },
  safetyStock: { type: Number, default: 10 },
  unit: { type: String, default: 'units' },
  location: { type: String, default: 'Main Warehouse Dock' }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactEmail: { type: String, default: 'N/A' },
  leadTimeDays: { type: Number, default: 3 },
  reliabilityScore: { type: Number, default: 5.0 },
  products: [{
    name: { type: String, required: true },
    sku: { type: String },
    unit: { type: String, default: 'units' },
    unitPrice: { type: Number, default: 0 }
  }]
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', supplierSchema);

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  outputQty: { type: Number, default: 1 },
  outputUnit: { type: String, default: 'units' },
  ingredients: [{
    rawMaterialId: { type: String, required: true },
    rawMaterialName: { type: String, required: true },
    quantityRequired: { type: Number, required: true },
    unit: { type: String, default: 'units' }
  }]
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

// --- UNIT CONVERSION LOGIC ---
const UNIT_CONVERSIONS = {
  // Mass (Base unit: Grams)
  ton: { family: 'mass', ratio: 1000000 },
  t: { family: 'mass', ratio: 1000000 },
  kg: { family: 'mass', ratio: 1000 },
  kgs: { family: 'mass', ratio: 1000 },
  kilogram: { family: 'mass', ratio: 1000 },
  kilograms: { family: 'mass', ratio: 1000 },
  g: { family: 'mass', ratio: 1 },
  gram: { family: 'mass', ratio: 1 },
  grams: { family: 'mass', ratio: 1 },
  mg: { family: 'mass', ratio: 0.001 },
  milligram: { family: 'mass', ratio: 0.001 },

  // Volume (Base unit: Milliliters)
  l: { family: 'volume', ratio: 1000 },
  liter: { family: 'volume', ratio: 1000 },
  liters: { family: 'volume', ratio: 1000 },
  ml: { family: 'volume', ratio: 1 },
  milliliter: { family: 'volume', ratio: 1 },
  milliliters: { family: 'volume', ratio: 1 },

  // Length (Base unit: Millimeters)
  km: { family: 'length', ratio: 1000000 },
  m: { family: 'length', ratio: 1000 },
  meter: { family: 'length', ratio: 1000 },
  meters: { family: 'length', ratio: 1000 },
  cm: { family: 'length', ratio: 10 },
  centimeter: { family: 'length', ratio: 10 },
  mm: { family: 'length', ratio: 1 },
  yard: { family: 'length', ratio: 914.4 },
  yards: { family: 'length', ratio: 914.4 },
  yd: { family: 'length', ratio: 914.4 },
  ft: { family: 'length', ratio: 304.8 },
  feet: { family: 'length', ratio: 304.8 }
};

function convertUnits(qty, fromUnit, toUnit) {
  const from = (fromUnit || '').toLowerCase().trim();
  const to = (toUnit || '').toLowerCase().trim();
  if (from === to) return qty;

  const uFrom = UNIT_CONVERSIONS[from];
  const uTo = UNIT_CONVERSIONS[to];

  if (uFrom && uTo && uFrom.family === uTo.family) {
    return (qty * uFrom.ratio) / uTo.ratio;
  }
  return qty;
}

// --- API ROUTES ---

// 1. Inventory Routes
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const deleted = await Inventory.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Material not found' });
    res.json({ message: 'Material deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Supplier Routes
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    const saved = await supplier.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Supplier not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. BOM Recipe Routes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    const saved = await recipe.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[DELETE RECIPE] Received request to delete ID or Name: "${id}"`);

    let deleted = null;

    // 1. If it is a valid 24-character MongoDB Hex ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Recipe.findByIdAndDelete(id);
    }

    // 2. Fallback: Check if it was stored with a custom string ID or matches by name
    if (!deleted) {
      deleted = await Recipe.findOneAndDelete({
        $or: [
          { _id: id },
          { id: id },
          { name: id }
        ]
      });
    }

    if (!deleted) {
      console.warn(`[DELETE RECIPE] Recipe "${id}" not found in MongoDB`);
      return res.status(404).json({ error: `Recipe with ID/Name "${id}" was not found in the database.` });
    }

    console.log(`[DELETE RECIPE] Successfully deleted:`, deleted.name);
    res.json({ message: 'Recipe deleted successfully', id });
  } catch (err) {
    console.error('[DELETE RECIPE ERROR]:', err);
    res.status(500).json({ error: err.message });
  }
});
// 4. PO Ingestion Route (Unit-Normalized)
app.post('/api/po/ingest', async (req, res) => {
  try {
    const { productName, name, sku, quantityReceived, quantity, unit, location } = req.body;
    const targetName = (productName || name || '').trim();
    const qty = Number(quantityReceived || quantity || 0);
    const inputUnit = (unit || 'units').trim();

    let query = [];
    if (sku) query.push({ sku: sku });
    if (targetName) query.push({ name: new RegExp(`^${targetName}$`, 'i') });

    let item = query.length > 0 ? await Inventory.findOne({ $or: query }) : null;

    if (item) {
      const convertedQty = convertUnits(qty, inputUnit, item.unit);
      item.currentBalance = parseFloat(((Number(item.currentBalance) || 0) + convertedQty).toFixed(4));
      await item.save();
      return res.json(item);
    } else {
      const newItem = await Inventory.create({
        name: targetName || 'Unnamed Material',
        sku: sku || `RAW-${Math.floor(100 + Math.random() * 900)}`,
        currentBalance: qty,
        safetyStock: 10,
        unit: inputUnit,
        location: location || 'Main Warehouse Dock'
      });
      return res.status(201).json(newItem);
    }
  } catch (err) {
    console.error('PO Ingestion DB Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Manufacturing Run Execution Route (Cross-Unit Deductions)
app.post('/api/manufacturing/execute', async (req, res) => {
  try {
    const { materialDeductions } = req.body;
    if (!Array.isArray(materialDeductions)) {
      return res.status(400).json({ error: 'Invalid deductions payload' });
    }

    for (const d of materialDeductions) {
      const rawNeeded = Number(d.totalQty || d.quantityRequired || 0);
      const recipeUnit = d.unit || 'units';

      let target = null;
      if (mongoose.Types.ObjectId.isValid(d.rawMaterialId)) {
        target = await Inventory.findById(d.rawMaterialId);
      }
      if (!target && d.rawMaterialName) {
        target = await Inventory.findOne({ name: new RegExp(`^${d.rawMaterialName.trim()}$`, 'i') });
      }

      if (target) {
        const deductionInWarehouseUnit = convertUnits(rawNeeded, recipeUnit, target.unit);
        const newBal = Math.max(0, (Number(target.currentBalance) || 0) - deductionInWarehouseUnit);
        target.currentBalance = parseFloat(newBal.toFixed(4));
        await target.save();
      }
    }

    const updatedLedger = await Inventory.find().sort({ createdAt: -1 });
    res.json({ message: 'Production run recorded successfully', inventory: updatedLedger });
  } catch (err) {
    console.error('Manufacturing Run Execution Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- SERVER BINDING & DATABASE CONNECTION ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Express server is LIVE on http://127.0.0.1:${PORT}`);
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Database:', MONGO_URI);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });