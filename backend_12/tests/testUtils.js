const fs = require("fs");
const path = require("path");

const storePath = path.join(__dirname, "..", "data", "store.json");

const TEST_TENANT_ID = "64b000000000000000000001";
const TEST_USER_ID = "64b000000000000000000002";

const seed = {
  tenants: [
    {
      _id: TEST_TENANT_ID,
      name: "Farhan Trading Ltd",
      email: "admin@farhantrading.demo",
      subscription: "Premium",
      createdAt: "2026-09-01T09:00:00.000Z"
    },
    {
      _id: "64b000000000000000000003",
      name: "ABC Inventory Ltd",
      email: "admin@abcinventory.demo",
      subscription: "Basic",
      createdAt: "2026-09-02T10:00:00.000Z"
    }
  ],
  auditlogs: [
    {
      _id: "audit-test-001",
      tenantId: TEST_TENANT_ID,
      userId: TEST_USER_ID,
      userName: "Farhan Ahmed",
      entity: "Inventory",
      action: "UPDATE",
      recordRef: "SKU-1001",
      reason: "Physical stock count correction",
      oldValue: { quantity: 10 },
      newValue: { quantity: 25 },
      createdAt: "2026-09-04T14:00:00.000Z"
    }
  ],
  notifications: [
    {
      _id: "notif-test-001",
      tenantId: TEST_TENANT_ID,
      type: "AUDIT_CHANGE",
      title: "Inventory updated",
      message: "Farhan Ahmed updated Inventory SKU-1001.",
      actorId: TEST_USER_ID,
      actorName: "Farhan Ahmed",
      entity: "Inventory",
      action: "UPDATE",
      recordRef: "SKU-1001",
      changes: [{ key: "quantity", before: 10, after: 25 }],
      isRead: false,
      createdAt: "2026-09-04T14:00:00.000Z"
    }
  ],
  activitylogs: []
};

function resetStore() {
  fs.writeFileSync(storePath, JSON.stringify(seed, null, 2));
}

function readStore() {
  return JSON.parse(fs.readFileSync(storePath, "utf8"));
}

module.exports = {
  TEST_TENANT_ID,
  TEST_USER_ID,
  resetStore,
  readStore
};
