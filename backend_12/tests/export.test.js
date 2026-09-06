process.env.USE_MONGODB = "false";
process.env.ENABLE_ZERO_ACTIVITY_JOB = "false";
process.env.DEV_USER_ROLE = "super_admin";

const request = require("supertest");
const { app } = require("../src/server");
const { resetStore } = require("./testUtils");

const binaryParser = (res, callback) => {
  res.setEncoding("binary");
  let data = "";

  res.on("data", chunk => {
    data += chunk;
  });

  res.on("end", () => {
    callback(null, Buffer.from(data, "binary"));
  });
};

describe("Module 4 - Export API", () => {
  beforeEach(() => {
    resetStore();
  });

  test("GET /api/module4/export/excel returns an XLSX file", async () => {
    const response = await request(app)
      .get("/api/module4/export/excel")
      .buffer(true)
      .parse(binaryParser)
      .expect(200);

    expect(response.headers["content-type"]).toMatch(
      /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/
    );
    expect(response.headers["content-disposition"]).toMatch(
      /INTrack_Module4\.xlsx/
    );
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(100);
  });

  test("GET /api/module4/export/pdf returns a PDF file", async () => {
    const response = await request(app)
      .get("/api/module4/export/pdf")
      .buffer(true)
      .parse(binaryParser)
      .expect(200);

    expect(response.headers["content-type"]).toMatch(/application\/pdf/);
    expect(response.headers["content-disposition"]).toMatch(
      /INTrack_Module4\.pdf/
    );
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(100);
    expect(response.body.subarray(0, 4).toString()).toBe("%PDF");
  });
});
