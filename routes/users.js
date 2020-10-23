const express = require('express');
const router = express.Router();
const { User, Course } = require('../models');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');


const authenticateUser = (req, res, next) => {
    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);


};

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

router.get("/users", asyncHandler( async (req,res) =>{
    const user = await User.findOne({
        where: {
            id: req.user.id
        },
        attributes: {
            exclude: ["password", "createdAt", "updatedAt"]
        }
    })
    res.status(200).json(user);
}));

router.post("/users", asyncHandler( async  (req, res, next) => {

   //Get the user from the request body
   const user = req.body;

   if(!user.FirstName)

   //Hash the new user's password
   user.password = bcryptjs.hashSync(user.password);

   //Create the new user and save it to the database
   User.create(user);

   //Set the status to 201 and end the response
   res.status(201).end();

}));


module.exports = router;
