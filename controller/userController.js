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
getProductDetails: async (req,res)=>{
  const userDetails = req.session.user
  userHelpers.proDetails(req.params.id).then((productDetails)=> {
  res.render('user/productDetails',{productDetails,userDetails, user:true})
  })
},

//SHOP CATEGORY-----------------------------------------------------------------------------------------

getShopCategory: async (req, res) => {

  try {

    const allCategories = await userHelpers.getAllCat()
    const allProducts = await userHelpers.getAllProducts()
    res.render('user/shopCategory', { user: true, allProducts, userDetails: req.session.user, allCategories })

  } catch (error) {
    console.log(error);
    res.redirect('/')
  }

},

//MEN CATEGORY -------------------------------------------------------------------------------------------
  getMenCategory:(req,res)=>{
    userHelpers.getAllProductsCat('men').then((allCatProducts)=>{
      let category = 'men'
      var userDetails = req.session
      res.render('user/category',{user:true, category,userDetails,allCatProducts})
    })

  },

//LOGOUT -------------------------------------------------------------------------------------------
getLogout: function (req, res) {
  req.session.loggedIn = false
  req.session.user = null
  res.redirect('/signUp ')
},
}