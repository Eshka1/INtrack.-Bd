const notificationController =
require("../controllers/notificationController");

const notificationService =
require("../services/notificationService");

jest.mock("../services/notificationService");


describe("Notification Controller Tests",()=>{


test("should return notifications",async()=>{


const req={
tenantId:"tenant1"
};


const res={
status:jest.fn().mockReturnThis(),
json:jest.fn()
};


notificationService.getNotifications
.mockResolvedValue([]);


await notificationController.getNotifications(req,res);


expect(res.status)
.toHaveBeenCalledWith(200);


});


test("should mark notification as read",async()=>{


const req={
params:{id:"123"}
};


const res={
status:jest.fn().mockReturnThis(),
json:jest.fn()
};


notificationService.markAsRead
.mockResolvedValue({
read:true
});


await notificationController.markNotificationRead(req,res);


expect(res.status)
.toHaveBeenCalledWith(200);


});


});