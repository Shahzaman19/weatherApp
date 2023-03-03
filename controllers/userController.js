const bcrypt = require('bcrypt')
const { User, schema } = require('../modal/user')
const axios = require('axios')
const apiKey = '583d2da5b39bcfa2d41fde112f51d75d'
const mongoose = require('mongoose')

exports.getUser = async (req, res) => {
    // let user = await User.find()
    // let page = Number(req.query.page) || 1;
    // let limit = Number(req.query.limit) || 3;
    // let skip = (page - 1) * limit;
    // user = user.skip(skip).limit(limit);
    // res.send(user);

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 3;
    let skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit).exec();

    res.send(users);
    console.log(users);

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


        const token = user.generateAuthToken();
        res.header('x-auth-token', token).json({ user: user })


    }
    catch (error) {
        console.error(error.message);
    }
};

exports.loginUser = async (req, res, next) => {
    try {

        let user = await User.findOne({ name: req.body.name })
        if (!user) { return res.status(400).send("Invalid name") };

        if (req.body.is_Active) {
            user.is_Active = true
            await user.save()
        }
        
        let isPassword = await bcrypt.compare(req.body.password, user.password)
        if (!isPassword) {
            return res.status(400).send("INVALID PASSWORD")
        }

        if (!user.is_Active) {
            return res.status(400).json({ message: 'User is not active' });
        }

        const token = user.generateAuthToken();
        return res.json({ token: token, msg: "Login Successfully" })
    }
    catch (error) {
        res.send(error.message)
    }
};

exports.editUser = async (req, res) => {
    const { id } = req.query;
    // console.log("REQ =>", req.user);
    const user = await User.findByIdAndUpdate(id, req.body)
    console.log("USER ROLE =>",user.role);
    if (!user) return res.status(403).send('User not found')
    
    if(user.role == 'admin'){
        user.is_Active = req.body.is_Active
    }
    else{
        console.log('ELSE PART WORK');
    }

    res.send(user);
}

exports.searchUser = async (req,res) => {
   const user = await User.findOne({email : req.body.email})

   if(!user) return res.status(400).send('User not found')

   res.json(user);
}

exports.userFavouriteLocation = async (req,res) => {
    // const { id } = req.query;
    // let page = Number(req.query.page) || 1;
    // let limit = Number(req.query.limit) || 3;
    // let skip = (page - 1) * limit
    // const user = await User.findById(id).skip(skip).limit(limit).exec();

    const { id } = req.query;
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 3;
    let skip = (page - 1) * limit;

    const user = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    { $skip: skip },
    { $limit: limit }
    ]);

    res.send(user);
    console.log("USER =>",user);


    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const { favourite_Location } = user; 
  
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${favourite_Location}&apiKey=${apiKey}`);
    console.log(response.data);
    res.send(response.data);


}
