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
    var userDetails = req.session.user
    
    try {
      if (userDetails){
      const allCategories = await userHelpers.getAllCat()
      const allProducts = await userHelpers.getAllProducts()
      res.render('user/shopCategory', { user: true, allProducts, userDetails: req.session.user, allCategories })
  
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
  getMenCategory:(req,res)=>{
    userHelpers.getAllProductsCat('men').then((allCatProducts)=>{
      let category = 'men'
      var userDetails = req.session
      res.render('user/category',{user:true, category,userDetails,allCatProducts})
    })

  },

//WOMEN CATEGORY -------------------------------------------------------------------------------------------
  getWomenCategory: (req,res)=>{
    userHelpers.getAllProductsCat('women').then((allCatProducts)=>{
      let category = 'women'
      var userDetails = req.session
      res.render('user/category',{user:true, category,userDetails,allCatProducts})
    })
 
  },

    //UNISEX CATEGORY -------------------------------------------------------------------------------------------
    getUnisexCategory: (req,res)=>{
      userHelpers.getAllProductsCat('UNISEX').then((allCatProducts)=>{
        let category = 'UNISEX'
        var userDetails = req.session
        res.render('user/category',{user:true, category,userDetails,allCatProducts})
      })
   
    },

  //KIDS CATEGORY -------------------------------------------------------------------------------------------
  getKidsCategory: (req,res)=>{
    userHelpers.getAllProductsCat('Kids').then((allCatProducts)=>{
      let category = 'Kids'
      var userDetails = req.session
      res.render('user/category',{user:true, category,userDetails,allCatProducts})
    })
 
  },

//GET CART ------------------------------------------------------------------------------------------------

getCart: async function (req, res, next) {
  var userDetails = req.session.user
  let cartCount = null
  if (userDetails) {
    
    let cartCount = await userHelpers.getCartCount(req.session.user._id)

    let products = await userHelpers.getCartProducts(req.session.user._id)
    if (products.length > 0) {
      totalValue = await userHelpers.getTotalAmount(req.session.user._id)
      
    } else {
      totalValue = 0
    }
    res.render('user/cart', { userDetails, totalValue,  cartCount, user: true, products })
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

postdelCartPro: async (req, res) => {
  try {
    const response = await userHelpers.delCartPro(req.body)
    res.json(response)
  } catch (error) {
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