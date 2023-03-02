const express = require('express');
const router =  express.Router()
const userController = require('../controllers/userController')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

router.get('/', auth, admin,  userController.getUser)
router.post('/', userController.createUser);
router.post('/login', userController.loginUser);


module.exports = router;