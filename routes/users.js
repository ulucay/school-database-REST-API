const express = require('express');
const router = express.Router();
const { User, Course } = require('../models');

// async handler for each route
function asyncHandler(cb){
    return async(req, res, next) =>{
        try{
            await cb(req, res, next);
        }catch(err){
            res.status(500).send(err);
        }
    }
}

router.post("/users", asyncHandler( async  (req, res, next) => {
   const user = req.body;

   User.create(user);

   res.status(201).end();


}));


module.exports = router;
