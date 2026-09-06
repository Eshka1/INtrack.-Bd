const fs = require('fs');
const path = require('path');

class Module4Store {
  constructor() {
    this.useMongo = String(process.env.MODULE4_USE_MONGODB || process.env.USE_MONGODB || 'false').toLowerCase() === 'true';
    this.file = process.env.MODULE4_DATA_FILE || path.join(__dirname, '..', '..', '..', 'data', 'module4-store.json');
    this.client = null;
    this.db = null;
  }

  async init() {
    if (this.useMongo) {
      const { MongoClient } = require('mongodb');
      const uri = process.env.MODULE4_MONGO_URI || process.env.MONGO_URI || process.env.MONGODB_URI;
      if (!uri) throw new Error('MONGO_URI is required when Module 4 MongoDB mode is enabled');
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db();
      return;
    }

    const dir = path.dirname(this.file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.file)) {
      fs.writeFileSync(this.file, JSON.stringify({
        tenants: [],
        auditlogs: [],
        activitylogs: [],
        notifications: []
      }, null, 2));
    }
  }

  read() {
    return JSON.parse(fs.readFileSync(this.file, 'utf8'));
  }

  write(data) {
    fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
  }

  id(value) {
    if (!this.useMongo) return value;
    const { ObjectId } = require('mongodb');
    try {
      return new ObjectId(value);
    } catch {
      return value;
    }
  }

  clean(doc) {
    if (!doc) return doc;
    const out = { ...doc };
    for (const key of ['_id', 'tenantId', 'userId']) {
      if (out[key] && typeof out[key] !== 'string') out[key] = out[key].toString();
    }
    return out;
  }

  async list(collection, filter = {}) {
    if (this.useMongo) {
      const query = { ...filter };
      if (query._id) query._id = this.id(query._id);
      if (query.tenantId) query.tenantId = this.id(query.tenantId);
      const rows = await this.db.collection(collection).find(query).sort({ createdAt: -1 }).toArray();
      return rows.map(row => this.clean(row));
    }

    const rows = this.read()[collection] || [];
    return rows.filter(row =>
      Object.entries(filter).every(([key, value]) => String(row[key]) === String(value))
    );
  }

  async findOne(collection, filter = {}) {
    return (await this.list(collection, filter))[0] || null;
  }

  async insert(collection, doc) {
    if (this.useMongo) {
      const insert = { ...doc, createdAt: doc.createdAt || new Date() };
      if (insert.tenantId) insert.tenantId = this.id(insert.tenantId);
      if (insert.userId) insert.userId = this.id(insert.userId);
      const result = await this.db.collection(collection).insertOne(insert);
      return this.clean({ ...insert, _id: result.insertedId });
    }

    const data = this.read();
    data[collection] = data[collection] || [];
    const record = {
      ...doc,
      _id: doc._id || `${collection}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: doc.createdAt || new Date().toISOString()
    };
    data[collection].unshift(record);
    this.write(data);
    return record;
  }

  async updateById(collection, id, patch) {
    if (this.useMongo) {
      const _id = this.id(id);
      await this.db.collection(collection).updateOne({ _id }, { $set: patch });
      return this.clean(await this.db.collection(collection).findOne({ _id }));
    }

    const data = this.read();
    const rows = data[collection] || [];
    const index = rows.findIndex(row => String(row._id) === String(id));
    if (index < 0) return null;
    rows[index] = { ...rows[index], ...patch, updatedAt: new Date().toISOString() };
    this.write(data);
    return rows[index];
  }
}

module.exports = new Module4Store();
