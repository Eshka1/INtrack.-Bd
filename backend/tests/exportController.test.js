const exportController =
require("../controllers/exportController");

const exportService =
require("../services/exportService");

jest.mock("../services/exportService");


describe("Export Controller Tests",()=>{


test("should export excel file",async()=>{

const req={
 tenantId:"tenant1"
};

const res={
 download:jest.fn(),
 status:jest.fn().mockReturnThis(),
 json:jest.fn()
};


exportService.generateExcel
.mockResolvedValue(
 "export.xlsx"
);


await exportController.exportExcel(req,res);


expect(res.download)
.toHaveBeenCalledWith(
"export.xlsx"
);


});


test("should handle export error",async()=>{


const req={
tenantId:"tenant1"
};

const res={
download:jest.fn(),
status:jest.fn().mockReturnThis(),
json:jest.fn()
};


exportService.generateExcel
.mockRejectedValue(
new Error("Failed")
);


await exportController.exportExcel(req,res);


expect(res.status)
.toHaveBeenCalledWith(500);


});


});