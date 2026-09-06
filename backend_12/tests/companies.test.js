process.env.USE_MONGODB = "false";
process.env.ENABLE_ZERO_ACTIVITY_JOB = "false";
process.env.DEV_USER_ROLE = "super_admin";

const request = require("supertest");
const { app } = require("../src/server");
const { resetStore, readStore } = require("./testUtils");

describe("Module 4 - Super Admin / Companies API", () => {
  beforeEach(() => {
    resetStore();
    process.env.DEV_USER_ROLE = "super_admin";
  });

  test("GET /api/module4/admin/companies lists registered companies", async () => {
    const response = await request(app)
      .get("/api/module4/admin/companies")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toHaveProperty("subscription");
  });

  test("POST /api/module4/admin/companies creates a new company", async () => {
    const response = await request(app)
      .post("/api/module4/admin/companies")
      .send({
        name: "Dhaka Manufacturing Ltd",
        email: "admin@dhakamfg.test",
        subscription: "Basic"
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("Dhaka Manufacturing Ltd");
    expect(response.body.data.subscription).toBe("Basic");

    const data = readStore();
    expect(
      data.tenants.some(company => company.email === "admin@dhakamfg.test")
    ).toBe(true);

    expect(
      data.notifications.some(
        item =>
          item.type === "COMPANY_CREATED" &&
          item.recordRef === "Dhaka Manufacturing Ltd"
      )
    ).toBe(true);
  });

  test("POST /api/module4/admin/companies rejects invalid email", async () => {
    const response = await request(app)
      .post("/api/module4/admin/companies")
      .send({
        name: "Invalid Email Company",
        email: "not-an-email",
        subscription: "Basic"
      })
      .expect(400);

    expect(response.body.message).toMatch(/valid company email/i);
  });

  test("POST /api/module4/admin/companies rejects duplicate email", async () => {
    const response = await request(app)
      .post("/api/module4/admin/companies")
      .send({
        name: "Duplicate Company",
        email: "admin@farhantrading.demo",
        subscription: "Premium"
      })
      .expect(409);

    expect(response.body.message).toMatch(/already exists/i);
  });

  test("PATCH subscription changes Basic to Premium and creates audit + notification", async () => {
    const companyId = "64b000000000000000000003";

    const response = await request(app)
      .patch(`/api/module4/admin/subscription/${companyId}`)
      .send({ plan: "Premium" })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.subscription).toBe("Premium");

    const data = readStore();

    const company = data.tenants.find(item => item._id === companyId);
    expect(company.subscription).toBe("Premium");

    expect(
      data.auditlogs.some(
        log =>
          log.entity === "Subscription" &&
          log.recordRef === "ABC Inventory Ltd" &&
          log.newValue?.plan === "Premium"
      )
    ).toBe(true);

    expect(
      data.notifications.some(
        item =>
          item.type === "SUBSCRIPTION_CHANGE" &&
          item.recordRef === "ABC Inventory Ltd"
      )
    ).toBe(true);
  });

  test("Super Admin endpoints reject a non-super-admin user", async () => {
    process.env.DEV_USER_ROLE = "warehouse_manager";

    const response = await request(app)
      .get("/api/module4/admin/companies")
      .expect(403);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/super admin access required/i);
  });
});
