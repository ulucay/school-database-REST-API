const express = require('express');
const router = express.Router();
const { User, Course } = require('../models');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const { check, validationResult } = require('express-validator/check');


//Authenticator middleware
const authenticateUser = async (req, res, next) => {
    let message = null;

    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);

    //If the user's credentials are available
    if(credentials){

        //Attempt to retrieve the user from the data by their username
        const user = await User.findOne({ where: { emailAddress: credentials.name } });

        //If user is available
        if(user){
            const authenticated = bcryptjs.compareSync(credentials.pass, user.password);

            //If user is authenticated
            if(authenticated){
                req.currentUser = user;
            }
            else{
                message = `Authentication failure for username: ${user.emailAddress}`;
            }

        }
        else{
            message = `User not found for username: ${credentials.name}`;
        }
    }
    else{
        message = 'Auth header not found';
    }

    //If there are error messages
    if(message){
        console.warn(message);

        // Return a response with a 401 Unauthorized HTTP status code.
        res.status(401).json({ message: 'Access Denied' });
    }else{
        next();
    }
};

//Async handler for each route
function asyncHandler(cb){
    return async(req, res, next) =>{
        try{
            await cb(req, res, next);
        }catch(err){
            res.status(500).send(err);
        }
    }
}

//Returns the currently authenticated user
router.get("/users", authenticateUser, asyncHandler( async (req,res) =>{
    const user = await User.findOne({
        where: {
            emailAddress: req.currentUser.emailAddress
        },
        attributes: {
            exclude: ["password", "createdAt", "updatedAt"]
        }
    })
    res.status(200).json(user);
}));

router.post("/users",
    [
        check("firstName")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage('Please provide a value for "first name"'),
        check("lastName")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage('Please provide a value for "last name"'),
        check("emailAddress")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage('Please provide a value for "email"'),
        check("password")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage('Please provide a value for "password"'),
    ],
    asyncHandler( async  (req, res, next) => {

  try{
      //Check validation result
      const errors = validationResult(req);
      //If there is a validation error then send 400 status code and error message
      if (!errors.isEmpty()) {
          const errorMessages = errors.array().map((error) => error.msg);
          return res.status(400).json({ errors: errorMessages });
      }

      //If validation is okay then , get the user from the request body
      let user = req.body;

      //Hash the new user's password
      if(user.password){
          user.password = bcryptjs.hashSync(user.password);
      }

      //Create the new user and save it to the database
      await User.create(user);

      //Set the status to 201 and end the response
      res.status(201).location('/').end();
  }
  catch(err){
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
          const errors = error.errors.map(err => err.message);
          res.status(400).json({ errors });
      } else {
          throw error;
      }
  }
}
));


module.exports = router;
