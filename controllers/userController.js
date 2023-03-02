const bcrypt = require('bcrypt')
const { User, schema } = require('../modal/user')
const jwt = require('jsonwebtoken')

exports.getUser = async (req,res) => {
    const user =  await User.find()
    res.send(user);
};

exports.createUser = async (req, res) => {
    try {
        const { error } = schema.validate(req.body)
        if (error) return res.status(404).send(error.details[0].message)

        let user = await User.findOne({ email: req.body.email })
        if (user) return res.status(400).send("User already registered")

        user = await new User(req.body)

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
        await user.save()
       

        const token = jwt.sign({userId : user._id , userRole : user.role}, process.env.PRIVATE_KEY)
        // console.log();
        
        // const token = user.generateAuthToken();
        res.header('x-auth-token', token).json({user : user})
       

    }
    catch (error) {
        console.error(error.message);
    }
};

exports.loginUser = async (req,res) => {
    try {
        
        let user = await User.findOne({name : req.body.name})
        if(!user) {return res.status(400).send("Invalid name")};
 
        let isPassword = await bcrypt.compare(req.body.password,user.password)
        if(!isPassword){
         return res.status(400).send("INVALID PASSWORD")
        }
        const token = req.header('x-auth-token')
        if(!token) return res.status(404).send('Token not found')

        // const decoded = jwt.verify(token, process.env.PRIVATE_KEY)
        //  const token =  user.generateAuthToken();
         res.json({token : token, msg : "Login Successfully"})
     } 
     catch (error) {
         res.send(error.message)
     }
};