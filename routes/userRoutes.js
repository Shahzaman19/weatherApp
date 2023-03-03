const express = require('express');
const router =  express.Router()
const userController = require('../controllers/userController')
const admin = require('../middleware/admin')
const auth = require('../middleware/auth')

router.get('/authenticate', auth, admin, userController.getUser)
router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);
router.put('/edit', userController.editUser);
router.get('/search', auth, admin, userController.searchUser);
router.get('/favouriteLocation', userController.userFavouriteLocation);


module.exports = router;