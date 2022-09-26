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
    res.render('user/user-home', { userDetails})
}  else{
  res.redirect('/login')
}
  },

//PROFILE ----------------------------------------------------------------------------------------------------
  getProfile: function (req, res) {
  var userDetails = req.session.user
  res.render('user/profile', { user: true, userDetails })
},

//PRODUCT DETAILS ---------------------------------------------------------------------------------------------------------
getProductDetails:  (req, res) => {

  const userDetails = req.session.user
  
  userHelpers.proDetails(req.params.id).then((productDetails) => {
    res.render('user/productDetails', { productDetails, user: true,wishlistCount, cartCount: req.session.cartVolume, userDetails })
  })
},


//SHOP CATEGORY-----------------------------------------------------------------------------------------
getShopCategory: async (req, res) => {

  try {
    res.render('user/shopCategory', { user: true, allProducts, cartCount,wishlistCount, userDetails: req.session.user, allCategories })

  } catch (error) {
    console.log(error);
    res.redirect('/')
  }

},

//LOGOUT -------------------------------------------------------------------------------------------
getLogout: function (req, res) {
  req.session.loggedIn = false
  req.session.user = null
  res.redirect('/signUp ')
},
}