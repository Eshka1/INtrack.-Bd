process.env.USE_MONGODB = "false";
process.env.ENABLE_ZERO_ACTIVITY_JOB = "false";
process.env.DEV_USER_ROLE = "super_admin";

const request = require("supertest");
const { app } = require("../src/server");
const { resetStore, readStore } = require("./testUtils");

describe("Module 4 - Notifications API", () => {
  beforeEach(() => {
    resetStore();
  });

  test("GET /api/module4/notifications returns notifications", async () => {
    const response = await request(app)
      .get("/api/module4/notifications")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].isRead).toBe(false);
    expect(response.body.data[0].actorName).toBe("Farhan Ahmed");
  });

  test("PATCH /notifications/:id/read marks one notification as read", async () => {
    const response = await request(app)
      .patch("/api/module4/notifications/notif-test-001/read")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.isRead).toBe(true);

    const data = readStore();
    const notification = data.notifications.find(
      item => item._id === "notif-test-001"
    );
    expect(notification.isRead).toBe(true);
  });

  test("PATCH /notifications/read-all marks all tenant notifications as read", async () => {
    const data = readStore();
    data.notifications.push({
      _id: "notif-test-002",
      tenantId: "64b000000000000000000001",
      type: "SUBSCRIPTION_CHANGE",
      title: "Subscription changed",
      message: "Plan changed",
      actorName: "Farhan Ahmed",
      entity: "Subscription",
      action: "UPDATE",
      recordRef: "ABC Inventory Ltd",
      changes: [{ key: "plan", before: "Basic", after: "Premium" }],
      isRead: false,
      createdAt: new Date().toISOString()
    });

    const fs = require("fs");
    const path = require("path");
    fs.writeFileSync(
      path.join(__dirname, "..", "data", "store.json"),
      JSON.stringify(data, null, 2)
    );

    const response = await request(app)
      .patch("/api/module4/notifications/read-all")
      .expect(200);

    expect(response.body.success).toBe(true);

    const after = readStore();
    expect(
      after.notifications
        .filter(item => item.tenantId === "64b000000000000000000001")
        .every(item => item.isRead === true)
    ).toBe(true);
  });

  test("PATCH unknown notification returns 404", async () => {
    const response = await request(app)
      .patch("/api/module4/notifications/does-not-exist/read")
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/not found/i);
  });
});
