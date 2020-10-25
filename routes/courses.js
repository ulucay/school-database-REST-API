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
        // Return a response with a 401 Unauthorized HTTP status code.
        res.status(401).json({ message: 'Access Denied' });
    }else{
        next();
    }
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

router.get('/courses', asyncHandler( async(req, res) => {
    const courses = await Course.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        include:{
            model:User,
            attributes:{
                exclude:["password", "creadetAt","updadetAt"]
            }
        }
    });
    res.status(200).json(courses);
}));

router.get('/courses/:id', asyncHandler( async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
        attributes: {
            exclude: ['createdAt', 'updatedAt']
        },
        include:{
            model:User,
            attributes:{
                exclude:["password", "creadetAt","updadetAt"]
            }
        }
    });

    //Check if there is a course then send 200, if not then send 404 status code.
    if(course){
        res.status(200).json(course);
    }else{
        res.status(404).json({ message: "Course not found." });
    }

}));

router.post('/courses',
[
        check("title")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage('Please provide a value for "title"'),
        check("description")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage('Please provide a value for "description"'),
        ],
        authenticateUser,
        asyncHandler( async(req, res, next) => {
            //Check validation result
            const errors = validationResult(req);
            //If there is a validation error then send 400 status code and error message
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map((error) => error.msg);
                return res.status(400).json({ errors: errorMessages });
            }

            const course = await Course.create(req.body);
            res.status(201).location(`/courses/${course.id}`).end();
}));


router.put('/courses/:id',
[
        check("title")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage('Please provide a value for "title"'),
        check("description")
            .exists({ checkNull: true, checkFalsy: true })
            .withMessage('Please provide a value for "description"'),
        ],
        authenticateUser,
        asyncHandler( async (req,res) =>{
            //Check validation result
            const errors = validationResult(req);
            //If there is a validation error then send 400 status code and error message
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map((error) => error.msg);
                return res.status(400).json({ errors: errorMessages });
            }
        const course =  await Course.findByPk(req.params.id);
        if (course.userId === req.currentUser.id) {
            await course.update(req.body);
            res.status(204).end();
        } else {
            res.status(403).end();
        }
}));

router.delete('/courses/:id', authenticateUser, asyncHandler( async (req,res) =>{
    const course = await Course.findByPk(req.params.id);
    if (course.userId === req.currentUser.id) {
        await course.destroy();
        res.status(204).end();
    } else {
        res.status(403).end();
    }
}));

module.exports = router;
