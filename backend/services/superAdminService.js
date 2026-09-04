const Tenant = require("../models/Tenant");
const Subscription = require("../models/Subscription");

class SuperAdminService {


    async getCompanies(){

        return await Tenant.find();

    }



    async updateSubscription(id, plan){

        return await Subscription.findOneAndUpdate(

            {
                tenantId:id
            },

            {
                plan:plan
            },

            {
                new:true
            }

        );

    }



    async getAnalytics(){

        const companies =
        await Tenant.countDocuments();


        return {

            totalCompanies: companies

        };

    }

}

module.exports = new SuperAdminService();