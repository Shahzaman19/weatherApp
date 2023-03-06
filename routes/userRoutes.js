const express = require('express');
const router =  express.Router()
const userController = require('../controllers/userController')
const admin = require('../middleware/admin')
const auth = require('../middleware/auth')

router.get('/authenticate', auth, admin, userController.getUser)
router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);
router.put('/edit', auth,  userController.editUser);
router.get('/search', auth, admin, userController.searchUser);
router.get('/favouriteLocation', auth, userController.userFavouriteLocation);
router.get('/weatherDetails', auth,  userController.weatherDetails);
router.put('/userStatus', auth, admin, userController.userStatus);


module.exports = router;