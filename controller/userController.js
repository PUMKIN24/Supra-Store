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



postAddAddress: (req, res, next) => {
  try {

    var userId = req.params.id
    let address = req.body
    console.log(address )
    userHelpers.postAddAddress(userId, address)
    res.redirect('/profile')
  } catch (error) {
    console.log(error, "postAddAddress");
    next(error)
  }
},

changePassword: (req, res, next) => {
  try {
    const newPassword = req.body.newPassword
    let userId = req.session.user._id
    userHelpers.postChangePassword(newPassword, userId)
    res.redirect('/profile')

  } catch (error) {
    console.log(error, "changePassword");
    next(error)
  }
},


postEditProfile: function (req, res, next) {
  try {

    var userId = req.params.id
    editedProfileDetails = req.body
    userHelpers.postEditProfile(userId, editedProfileDetails).then(() => {
      req.session.user.username = editedProfileDetails.name
      res.redirect('/profile')

    }).catch((error) => {
      console.log(error, "postEditProfile");
      next(error)
    })
  } catch (error) {
    console.log(error, "postEditProfile");
    next(error)
  }
},

postDeleteAddress: (req,res,next) => {
  try {
    let userId = req.body.user
    let addressId = req.body.addressId
    let response = userHelpers.postDeleteAddress(userId, addressId)
    res.json(response)
    res.redirect('/profile')

  } catch (error) {
    next(error)
  }
},

postEditAddress: (req, res, next) => {
  userHelpers.postEditAddress(req.body).then((response) => {
    console.log(response)
    res.json(response)
  }).catch((error) => {
    console.log(error, "posteditaddress");
    next(error)
  })

},



//---------------------------------------------------------------------------------------------------




currentAddress: async (req, res, next) => {
  try {
    let userId = req.body.user
    let addressId = req.body.addressId
    let response = await userHelpers.postCurrentAddress(userId, addressId)
    res.json(response)
  } catch (error) {
    console.log(error, "CurrentAddress");
    next(error)
  }


},


getDeliveryAddress: async (req, res, next) => {
  try {
    let userId = req.body.user
    let addressId = req.body.addressId
    let response = await userHelpers.getDeliveryAddress(userId, addressId)
    res.json(response)
  } catch (error) {
    console.log(error, "getDeliveryAddress");
    next(error)
  }

},
//-------------------------------------------------------------------------------------------------
getOrderPlaced: async (req, res, next) => {
  try {
    var cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    res.render('user/orderSuccess', { user: true, wishlistCount, cartCount, userDetails: req.session.user })
  } catch (error) {
    console.log(error, "getOrderPlaced");
    next(error)
  }
},

getCheckOut: async (req, res, next) => {
  try {
    if (req.session.user) {
      let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      let totalValue = await userHelpers.getTotalAmount(req.session.user._id)

      let products = await userHelpers.getCartProducts(req.session.user._id)
      var cartCount = await userHelpers.getCartCount(req.session.user._id)
      res.render('user/checkout', { totalValue, user: true, wishlistCount, products, cartCount, userDetails: req.session.user })
    }

  } catch (error) {
    console.log(error, "getCheckOut");
    next(error)
  }
},
postCheckout: async (req, res, next) => {
  try {
    
    let order = req.body
    products = await userHelpers.getCartProductList(req.body.userId)
    totalPrice = await userHelpers.getTotalAmount(req.body.userId)
    let Total = order.Total
    Total = parseInt(Total)

    userHelpers.placeOrder(order, products, totalPrice).then((orderId) => {
      if (req.body['Payment-method'] === 'COD') {
        res.json({ codSuccess: true })
      } else {
        userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response)
        }).catch((error) => {
          console.log(error, "generateRazorpay");
          error.error = true
          res.json(error)
        })
      }
    })

  } catch (error) {
    console.log(error, "postCheckout");
    next(error)
  }
},


postVerifyPayment: (req, res, next) => {
  userHelpers.postVerifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err, "postVerifyPayment");
    res.json({ status: false, errMsg: "" })
  })
},





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

postDelWishlistPro: async (req, res) => {
  try {
    const response = await userHelpers.delWishlistPro(req.body)
    res.json(response)
  } catch (error) {
    res.redirect('/')
  }
},

//ORDERS---------------------------------------------------------------------------------------------------

getViewOrders: async (req, res, next) => {
  try {
    let cartCount = null
    let wishlistCount = null
    if (req.session.user._id) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      totalValue = await userHelpers.getTotalAmount(req.session.user._id)
    }
    userHelpers.getUserOrders(req.session.user._id).then((orders) => {
      res.render('user/orders', { user: true, wishlistCount,totalValue, orders, cartCount, userDetails: req.session.user })
    }).catch((error) => {
      console.log(error, "getUserOrders");
      next(error)
    })
  } catch (error) {
    console.log(error, "getviewOrders");
    next(error)
  }
},

getViewProducts: async (req, res, next) => {
  try {
    let orderId = req.params.id
    var cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    let orders = await userHelpers.getUserSpecificOrders(orderId)
    totalValue = await userHelpers.getTotalAmount(req.session.user._id)
    let totalOrderAmount = orders.total
    
    userHelpers.getOrderProducts(orderId).then((products) => {
      res.render('user/viewOrderedProducts', { user: true, wishlistCount, products,totalValue, totalOrderAmount, cartCount, userDetails: req.session.user })

    }).catch((error)=>{
      console.log(error,"getOrderProducts");
      next(error)
    })
  } catch (error) {
    console.log(error, "getViewproducts");
    next(error)
  }
},





//LOGOUT -------------------------------------------------------------------------------------------
getLogout: function (req, res) {
  req.session.loggedIn = false
  req.session.user = null
  res.redirect('/signUp ')
}
}