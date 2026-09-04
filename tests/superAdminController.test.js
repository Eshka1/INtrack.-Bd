const superAdminController =
require("../controllers/superAdminController");

const superAdminService =
require("../services/superAdminService");

jest.mock("../services/superAdminService");


describe("Super Admin Controller Tests",()=>{


test("should deny normal user",async()=>{


const req={
user:{
role:"user"
}
};


const res={
status:jest.fn().mockReturnThis(),
json:jest.fn()
};


await superAdminController.getAllCompanies(req,res);


expect(res.status)
.toHaveBeenCalledWith(403);


});


test("should return companies for admin",async()=>{


const req={
user:{
role:"super_admin"
}
};


const res={
status:jest.fn().mockReturnThis(),
json:jest.fn()
};


superAdminService.getCompanies
.mockResolvedValue([]);


await superAdminController.getAllCompanies(req,res);


expect(res.status)
.toHaveBeenCalledWith(200);


});


});