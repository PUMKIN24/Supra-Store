var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')

//SIGNUP ---------------------------------------------------------------------------------------
router.get('/signUp', userController.getSignUp)

router.post('/signUp', userController.postSignUp)

router.post('/otp', userController.postOtp)


//LOGIN ----------------------------------------------------------------------------------------
router.get('/login', userController.getLogin)

router.post('/login', userController.postLogin)


//HOMEPAGE ---------------------------------------------------------------------------------------
router.get('/', userController.getHomepage)

//PROFILE --------------------------------------------------------------------------------------------------
router.get('/profile', userController.getProfile)

//SHOP -------------------------------------------------------------------------------------------------------
router.get('/shopCategory', userController.getShopCategory)

//PRODUCT DETAILS ---------------------------------------------------------------------------------------------
router.get('/productDetails/:id',userController.getProductDetails)

//LOGOUT -------------------------------------------------------------------------------------------
router.get('/logout', userController.getLogout)



module.exports = router;
