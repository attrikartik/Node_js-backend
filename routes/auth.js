const express = require('express');
const { body} = require("express-validator");
const router = express.Router();
const User = require("../models/user");
const authController = require('../controllers/auth');
router.post ('/signup',[
    body( 'email').isEmail().withMessage("Enter valid email")
    .custom((value,{req}) =>{
        return User.findOne({email:email})
        .then(userDoc =>{
            if(userDoc){
                return Promise.reject('Email Exists');
            }
        });
    }).normalizeEmail(),
    body('password').trim().isLength({min:5}),
    body('name').trim().not().isEmpty()
],authController.signup)


module.exports = router;