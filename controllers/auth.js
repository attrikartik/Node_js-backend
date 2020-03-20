const User = require('../models/user');
const {validationResult} = require('express-validator');
const bcrypt = require("bcryptjs");
exports.signup = (req, res,next)=>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
       const error = new Error('Validation failed');
       error.statusCode = 422;
       error.data =  errors.array();
       throw new error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password,12)
    .then(hashedPassword=>{
        const user = new User({
            email:email,
            name:name,
            password:hashedPassword
        })
        return user.save();
    })
    .then(result=>{
        res.status(200).json({message:'user created',userId:result._id})
    })
    .catch(error=>{
        if(!error.statusCode){
            error.statusCode = 500;
          }
          next(error);
    })
}