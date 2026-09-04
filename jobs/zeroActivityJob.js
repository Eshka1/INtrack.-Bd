const cron = require("node-cron");

const Tenant = require("../models/Tenant");
const ActivityLog = require("../models/ActivityLog");
const notificationService = require("../services/notificationService");


// Checks inactive tenants every day at midnight
const startZeroActivityJob = () => {

    cron.schedule("0 0 * * *", async () => {

        try {

            const tenants = await Tenant.find();


            for (const tenant of tenants) {


                const yesterday = new Date();

                yesterday.setDate(
                    yesterday.getDate() - 1
                );


                const activity =
                    await ActivityLog.findOne({

                        tenantId: tenant._id,

                        createdAt: {
                            $gte: yesterday
                        }

                    });



                // No activity found
                if (!activity) {


                    await notificationService
                    .createZeroActivityNotification(
                        tenant._id
                    );


                    console.log(
                        `Zero activity notification created for tenant ${tenant._id}`
                    );

                }


            }


        } catch(error) {


            console.error(
                "Zero activity job failed:",
                error.message
            );


        }


    });


};


module.exports = startZeroActivityJob;