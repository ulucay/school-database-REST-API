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

module.exports = router;