// Module 4 authentication bridge
// Uses existing project authentication.
// Expected from previous middleware:
// req.user
// req.tenantId

module.exports = function module4AuthMiddleware(req, res, next){

    if(!req.user){

        return res.status(401).json({
            success:false,
            message:"Authentication required"
        });

    }


    if(!req.tenantId){

        return res.status(401).json({
            success:false,
            message:"Tenant information missing"
        });

    }


    next();

};