var userHelpers = require('../helpers/user-helpers')
var twilioHelpers = require('../helpers/twilio-helpers')
const twilio = require('twilio')
const { response } = require('express')




module.exports = {

//SIGNUP-----------------------------------------------------------------------------------------

getSignUp: function (req, res, next) {
  res.render('user/signUp')
},

postSignUp: function (req, res, next) {
  req.session.body = req.body
  twilioHelpers.doSms(req.session.body).then((data) => {
    
    if (data) {
      res.render('user/otp')
    } else {
      res.redirect('/signUp')
    }
  })
},

postOtp: (req, res, next) => {
  twilioHelpers.otpVerify(req.body, req.session.body).then((response) => {
    userHelpers.doSignup(req.body).then((response) => {
      res.redirect('/login')
    })
  })
},


  


//LOGIN-----------------------------------------------------------------------------------------------
    getLogin: function (req, res) {
      if (req.session.loggedIn){
        res.redirect('/')
      }else {

        res.render('user/login',{loginErr:req.session.loginErr})
        req.session.loginErr = false
      }
    },
    postLogin: async function (req, res) {
      userHelpers.doLogin(req.body).then((response) => {
        if (response.status) {
          req.session.loggedIn = true
          req.session.user = response.user;
          res.redirect('/')
        } else {
          req.session.loginErr = "Invalid Email or Password"
          res.redirect('/login')
        }
      })
    },

//HOMEPAGE----------------------------------------------------------------------------------------------

  getHomepage: async function (req, res) {
  userDetails = req.session.user
  if (userDetails) {
    var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    res.render('user/user-home', { userDetails,wishlistCount,cartCount})
}  else{
  res.redirect('/login')
}
  },

//PROFILE ----------------------------------------------------------------------------------------------------
  getProfile: async function (req, res) {
  var userDetails = req.session.user
  if (userDetails){
    var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
  res.render('user/profile', { user: true, userDetails ,wishlistCount,cartCount})
}},

//PRODUCT DETAILS ---------------------------------------------------------------------------------------------------------
getProductDetails: async (req,res)=>{
  const userDetails = req.session.user
  if (userDetails){
    var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    let cartCount = await userHelpers.getCartCount(req.session.user._id) 
  userHelpers.proDetails(req.params.id).then((productDetails)=> {
  res.render('user/productDetails',{productDetails,userDetails, user:true,wishlistCount,cartCount})
  })}
},

//SHOP CATEGORY-----------------------------------------------------------------------------------------

  getShopCategory: async (req, res) => {
    var userDetails = req.session.user
    
    try {
      if (userDetails){
      const allCategories = await userHelpers.getAllCat()
      const allProducts = await userHelpers.getAllProducts()
      var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      let cartCount = await userHelpers.getCartCount(req.session.user._id)
      res.render('user/shopCategory', { user: true, allProducts, userDetails: req.session.user,wishlistCount,cartCount, allCategories })
  
    } } catch (error) {
      console.log(error);
      res.redirect('/')
    }
  
  },

  shopALL: async (req, res) => {
    allFilteredProducts = await userHelpers.getAllProducts()
    res.redirect('/shopCategory')
  },





//MEN CATEGORY -------------------------------------------------------------------------------------------
  getMenCategory:async (req,res)=>{
    if (userDetails){
      var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      let cartCount = await userHelpers.getCartCount(req.session.user._id)  
    userHelpers.getAllProductsCat('men').then((allCatProducts)=>{
      let category = 'men'
      var userDetails = req.session
      res.render('user/category',{user:true, category,userDetails,wishlistCount,cartCount,allCatProducts})
    })}

  },

//WOMEN CATEGORY -------------------------------------------------------------------------------------------
  getWomenCategory:async (req,res)=>{
    if (userDetails){
      var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      let cartCount = await userHelpers.getCartCount(req.session.user._id)  
    userHelpers.getAllProductsCat('women').then((allCatProducts)=>{
      let category = 'women'
      var userDetails = req.session
      res.render('user/category',{user:true, category,userDetails,allCatProducts,wishlistCount,cartCount})
    })}
 
  },

    //UNISEX CATEGORY -------------------------------------------------------------------------------------------
    getUnisexCategory:async (req,res)=>{
      if (userDetails){
        var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
        let cartCount = await userHelpers.getCartCount(req.session.user._id)  
      userHelpers.getAllProductsCat('UNISEX').then((allCatProducts)=>{
        let category = 'UNISEX'
        var userDetails = req.session
        res.render('user/category',{user:true, category,userDetails,allCatProducts,cartCount,wishlistCount})
      })}
   
    },

  //KIDS CATEGORY -------------------------------------------------------------------------------------------
  getKidsCategory:async (req,res)=>{
    if (userDetails){
      var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      let cartCount = await userHelpers.getCartCount(req.session.user._id)  
    userHelpers.getAllProductsCat('Kids').then((allCatProducts)=>{
      let category = 'Kids'
      var userDetails = req.session
      res.render('user/category',{user:true, category,userDetails,allCatProducts,cartCount,wishlistCount})
    })}
 
  },

//GET CART ------------------------------------------------------------------------------------------------

getCart: async function (req, res, next) {
  var userDetails = req.session.user
  let cartCount = null
  if (userDetails) {
    var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    let cartCount = await userHelpers.getCartCount(req.session.user._id)
    let products = await userHelpers.getCartProducts(req.session.user._id)
    if (products.length > 0) {
      totalValue = await userHelpers.getTotalAmount(req.session.user._id)
     
    } else {
      totalValue = 0
    }
    res.render('user/cart', { userDetails, totalValue, wishlistCount, cartCount, user: true, products })
  } else {
    res.redirect('/login')
  }
},




//ADD TO CART -----------------------------------------------------------------------------------------------
getAddToCart: function (req, res) {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })

  })

  // res.redirect('/shopCategory')
},

//DEL CART PRODUCT ----------------------------------------------------------------------------------------

postDelCartPro: async (req, res) => {
  try {
    const response = await userHelpers.delCartPro(req.body)
    res.json(response)
  } catch (error) {
    res.redirect('/')
  }


},

//postChangeProductQuantity-----------------------------------------------------------------------------------

postChangeProductQuantity: async (req, res) => {
  try {
    let response = await userHelpers.changeProductQuantity(req.body)
    response.proTotal = await userHelpers.postProTotal(req.body.user, req.body.product)
    response.total = await userHelpers.getTotalAmount(req.session.user._id)
    res.json(response)
  } catch (error) {
    console.log(error);
    res.redirect('/')
  }
},

//WISHLIST--------------------------------------------------------------------------------------------
getAddToWishlist: function (req, res) {
  userHelpers.addToWishlist(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })

  })
},



getWishlist: async function (req, res, next) {
  var userDetails = req.session.user
  let wishlistCount = null
  if (userDetails) {
    var cartCount = await userHelpers.getCartCount(req.session.user._id)
    req.session.cartVolume = cartCount;
    let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    let products = await userHelpers.getWishlistProducts(req.session.user._id)
    res.render('user/wishlist', { userDetails, cartCount, wishlistCount, user: true, products })
  } else {
    res.redirect('/login')
  }
},




//LOGOUT -------------------------------------------------------------------------------------------
getLogout: function (req, res) {
  req.session.loggedIn = false
  req.session.user = null
  res.redirect('/signUp ')
},
}