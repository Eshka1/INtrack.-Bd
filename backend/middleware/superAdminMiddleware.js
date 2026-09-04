module.exports = function superAdminMiddleware(req,res,next){

    if(!req.user){

        return res.status(401).json({
            success:false,
            message:"Unauthorized"
        });

    }


    if(req.user.role !== "super_admin"){

        return res.status(403).json({
            success:false,
            message:"Super admin access required"
        });

    }


    next();

};