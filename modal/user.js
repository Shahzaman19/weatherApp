const Joi = require('joi')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name :{
        type : String,
        minlength : 5,
        maxlength : 255,
        required : true
    },
    password :{
        type : String,
        minlength : 5,
        maxlength : 255,
        required : true
    },
    email:{
        type : String,
        minlength : 5,
        maxlength : 255,
        unique : true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    is_Active: {
        type: Boolean,
        default : false         
    },
    favourite_Location : {
        type : String,
        // default : 'Mumbai'
    }
});


// userSchema.methods.generateAuthToken = function(){
//     const token = jwt.sign({ userId: this._id , userRole : this.role}, process.env.PRIVATE_KEY);
//     return token;
// }

const User = mongoose.model('users',userSchema) 
        const schema = Joi.object({
        name : Joi.string().min(5).max(50).required(),
        password : Joi.string().min(5).max(255).required(),
        email : Joi.string().min(5).max(255).required().email(),
        role : Joi.string().min(3).max(255),
        is_Active : Joi.string().min(3).max(255),
        favourite_Location : Joi.string().min(3).max(255),
    })



exports.User = User;
exports.schema = schema;