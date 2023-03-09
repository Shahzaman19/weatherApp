const bcrypt = require('bcrypt')
const { User, schema } = require('../modal/user')
const axios = require('axios')
const apiKey = '583d2da5b39bcfa2d41fde112f51d75d'
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

//Getting all USER with pagination
exports.getUser = async (req, res) => {
   try {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 3;
    let skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit);


    res.send(users); 
   } 
   catch (error) {
    res.send(error.message)
   }

     

};

//Creating a USER
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

        res.send(user)


    }
    catch (error) {
        console.error(error.message);
    }
};

//Login with USER
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

       const token = jwt.sign({userId : user._id, userRole : user.role}, process.env.PRIVATE_KEY)
        return res.json({ token: token, msg: "Login Successfully" })
    }
    catch (error) {
        res.send(error.message)
    }
};

//Can edit user with whole properties
exports.editUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user.userId, req.body);

    if (!user) return res.status(403).send('User not found')

    let isPassword = await bcrypt.compare(req.body.password, user.password)
        if (isPassword) {
            return res.status(400).send("INVALID PASSWORDd")
        }

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
        await user.save()



    res.send(user);
}

//Search User with based on their emails
exports.searchUser = async (req,res) => {
   const user = await User.findOne({email : req.body.email})

   if(!user) return res.status(400).send('User not found')

  

   res.json(user);
}

//Only Admin can change users "is_Active" status
exports.updateUser = async (req, res) => {
    try {
      const updatedUser = await User.updateOne(
        { email: req.body.email },
        { $set: { is_Active : req.body.is_Active } }
      );
      if (!updatedUser) {
        return res.status(400).send('User not found');
      }
  
      res.json(updatedUser);

        

} catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
};
  
//Users favouriteLocation with Third party Api and pagination
exports.userFavouriteLocation = async (req,res) => {

    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 3;
    let skip = (page - 1) * limit;

try {
  const user = await User.findById(req.user.userId, req.body);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const { favourite_Location } = user;
  
  const response = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=${favourite_Location}&units=metric&appid=${apiKey}`);

  const weatherList = response.data.list;
  const paginatedWeatherList = weatherList.slice(skip, skip + limit);

  res.send(paginatedWeatherList);
} catch (error) {
  console.log(error);
  res.status(500).json({ message: 'Server Error' });
}



}

//WeatherDeatils of API
exports.weatherDetails = async (req,res) => {
    const {location} = req.query;

    const user = await User.findById(req.user.userId)
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${location}&apiKey=${apiKey}`);
    res.send(response.data);

}

exports.userStatus = async (req,res) => {
    const user = await User.findByIdAndUpdate(req.user.userId, req.body);

    if (!user) return res.status(403).send('User not found')

    if(req.user.userRole == 'admin'){
       user.is_Active = true
    }else{
        console.log("User is not admin");
    }
    res.send(user);

}