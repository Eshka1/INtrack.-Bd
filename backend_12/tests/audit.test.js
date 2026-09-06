process.env.USE_MONGODB = "false";
process.env.ENABLE_ZERO_ACTIVITY_JOB = "false";
process.env.DEV_USER_ROLE = "super_admin";

const request = require("supertest");
const { app } = require("../src/server");
const { resetStore, readStore } = require("./testUtils");

describe("Module 4 - Audit Trail API", () => {
  beforeEach(() => {
    resetStore();
  });

  test("GET /api/module4/audit returns tenant audit records", async () => {
    const response = await request(app)
      .get("/api/module4/audit")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty("entity");
    expect(response.body.data[0]).toHaveProperty("oldValue");
    expect(response.body.data[0]).toHaveProperty("newValue");
  });

  test("POST /api/module4/audit accepts a valid meaningful UPDATE", async () => {
    const payload = {
      entity: "Inventory",
      action: "UPDATE",
      recordRef: "SKU-2002",
      reason: "Warehouse physical count correction",
      oldValue: { quantity: 20 },
      newValue: { quantity: 35 }
    };

    const response = await request(app)
      .post("/api/module4/audit")
      .send(payload)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.entity).toBe("Inventory");
    expect(response.body.data.action).toBe("UPDATE");

    const data = readStore();
    expect(data.auditlogs.some(log => log.recordRef === "SKU-2002")).toBe(true);

    const notification = data.notifications.find(
      item => item.recordRef === "SKU-2002"
    );
    expect(notification).toBeDefined();
    expect(notification.actorName).toBe("Farhan Ahmed");
    expect(notification.changes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "quantity",
          before: 20,
          after: 35
        })
      ])
    );
  });

  test("POST /api/module4/audit rejects identical Old and New values", async () => {
    const response = await request(app)
      .post("/api/module4/audit")
      .send({
        entity: "Inventory",
        action: "UPDATE",
        recordRef: "SKU-3003",
        reason: "Attempted stock adjustment",
        oldValue: { quantity: 15 },
        newValue: { quantity: 15 }
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/must be different/i);
  });

  test("POST /api/module4/audit rejects a short reason", async () => {
    const response = await request(app)
      .post("/api/module4/audit")
      .send({
        entity: "Inventory",
        action: "UPDATE",
        recordRef: "SKU-4004",
        reason: "short",
        oldValue: { quantity: 1 },
        newValue: { quantity: 2 }
      })
      .expect(400);

    expect(response.body.message).toMatch(/at least 8 characters/i);
  });

  test("POST /api/module4/audit requires New Value for CREATE", async () => {
    const response = await request(app)
      .post("/api/module4/audit")
      .send({
        entity: "Supplier",
        action: "CREATE",
        recordRef: "SUP-01",
        reason: "Register new supplier record",
        oldValue: null,
        newValue: null
      })
      .expect(400);

    expect(response.body.message).toMatch(/CREATE requires New Value/i);
  });
});
