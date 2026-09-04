const auditController = require("../controllers/auditController");
const auditService = require("../services/auditService");

jest.mock("../services/auditService");

describe("Audit Controller Tests", () => {

    test("should create audit log successfully", async () => {

        const req = {
            user:{_id:"user1"},
            tenantId:"tenant1",
            body:{
                entity:"Inventory",
                action:"UPDATE",
                oldValue:{qty:10},
                newValue:{qty:20}
            }
        };

        const res = {
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        };

        auditService.createAuditLog.mockResolvedValue({
            _id:"audit1"
        });

        await auditController.createAuditLog(req,res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalled();

    });


    test("should reject unauthorized user", async()=>{

        const req={
            body:{}
        };

        const res={
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        };

        await auditController.createAuditLog(req,res);

        expect(res.status).toHaveBeenCalledWith(401);

    });

});