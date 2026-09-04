const exportController = require("../controllers/exportController");
const exportService = require("../services/exportService");

jest.mock("../services/exportService");

describe("Export Controller Tests", () => {
    test("should export excel buffer", async () => {
        const req = { tenantId: "64b000000000000000000001" };
        const buffer = Buffer.from("excel-data");
        const res = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };

        exportService.generateExcel.mockResolvedValue(buffer);

        await exportController.exportExcel(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith(buffer);
    });

    test("should handle export error", async () => {
        const req = { tenantId: "64b000000000000000000001" };
        const res = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };

        exportService.generateExcel.mockRejectedValue(new Error("Failed"));

        await exportController.exportExcel(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
