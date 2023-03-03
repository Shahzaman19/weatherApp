const mongoose = require('mongoose')
require('dotenv').config();
const express = require('express')
const app = express()
app.use(express.json())

port = process.env.PORT || 3000;
const users = require('./routes/userRoutes')

mongoose.connect("mongodb://127.0.0.1:27017/weatherApp")
.then(() => console.log  ('Connected to Mongo'))
.catch(() => console.log('Not connected'))


app.use('/api/users', users);

app.listen(port, () => console.log(`Connected to ${port} port`))


