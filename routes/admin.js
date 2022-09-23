var express = require('express');
var router = express.Router();

/* GET users listing. */


// LOGIN --------------------------------------------------------------------
router.get('/', function(req, res, next) {
  res.render('admin/page-login' , {layout: 'admin-layout'} );
});



//  HOMEPAGE-----------------------------------------------------------------
router.get('/adminHome', function(req, res, next) {

  res.render('admin/admin-home', { layout: 'admin-layout', admin: true });
});


//  VIEW PRODUCTS------------------------------------------------------------
router.get('/viewProducts', function(req, res, next) {
  res.render('admin/viewProducts' , {layout: 'admin-layout', admin: true });
});



// ADD PRODUCT-----------------------------------------------------------------
router.get('/addProduct', function(req, res, next) {
  res.render('admin/addProduct' , {layout: 'admin-layout', admin: true });
});

router.post('/addProduct', (req,res)=>{
  console.log(req.body)
  console.log(req.files.images)
})


// CATEGORIES--------------------------------------------------------------------
router.get('/categories', function(req, res, next) {
  res.render('admin/categories' , {layout: 'admin-layout', admin: true });
});


//  USERS-------------------------------------------------------------------------
router.get('/users', function(req, res, next) {
  res.render('admin/users' , {layout: 'admin-layout', admin: true });
});

//  ORDERS-----------------------------------------------------------------------
router.get('/orders', function(req, res, next) {
  res.render('admin/orders' , {layout: 'admin-layout', admin: true });
});


//
// router.get('/pageRegister', function(req, res, next) {
//   res.render('admin/page-register' , { admin: true });
// });

//  EDIT PRODUCT-------------------------------------------------------------------
router.get('/editProduct', function(req, res, next) {
  res.render('admin/editProduct' , {layout: 'admin-layout', admin: true });
});









module.exports = router;
