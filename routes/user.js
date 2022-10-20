var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')

//SIGNUP ---------------------------------------------------------------------------------
router.get('/signUp', userController.getSignUp)

router.post('/signUp', userController.postSignUp)

router.post('/otp', userController.postOtp)


//LOGIN -----------------------------------------------------------------------------------
router.get('/login', userController.getLogin)

router.post('/login', userController.postLogin)


//HOMEPAGE ---------------------------------------------------------------------------------
router.get('/', userController.getHomepage)

//PROFILE ----------------------------------------------------------------------------------
router.get('/profile', userController.getProfile)
router.post('/changePassword/:id',userController.changePassword)
router.post('/editProfile/:id',userController.postEditProfile)
router.post('/addAddress/:id',userController.postAddAddress)
router.post('/deleteAddress',userController.postDeleteAddress)




//SHOP ----------------------------------------------------------------------------------------
router.get('/shopCategory', userController.getShopCategory)
router.get('/shopALL',userController.shopALL)

//CATEGORY --------------------------------------------------------------
router.get('/menCategory', userController.getMenCategory)
router.get('/womenCategory',userController.getWomenCategory)
router.get('/unisexCategory',userController.getUnisexCategory)
router.get('/kidsCategory',userController.getKidsCategory)


//PRODUCT DETAILS ------------------------------------------------------------------------------
router.get('/productDetails/:id',userController.getProductDetails)

//CART -----------------------------------------------------------------------------------------
router.get('/cart/:id',userController.getCart)
router.post('/delete-cart-product',userController.postDelCartPro)
router.get('/addToCart/:id', userController.getAddToCart)
router.post('/change-product-quantity',userController.postChangeProductQuantity)

//WISHLIST------------------------------------------------------------------------------------------
router.get('/addToWishlist/:id', userController.getAddToWishlist)
router.get('/wishList/:id',userController.getWishlist)
router.post('/delete-wishlist-product',userController.postDelWishlistPro)

//CHECKOUT-----------------------------------------------------------------------------------------
router.get('/place-order',userController.getCheckOut)



//ORDER -------------------------------------------------------------------------------------------
router.get('/orderPlaced', userController.getOrderPlaced)


//LOGOUT -----------------------------------------------------------------------------------------
router.get('/logout', userController.getLogout)



module.exports = router;
