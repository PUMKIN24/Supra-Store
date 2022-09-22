var express = require('express');
var router = express.Router();

/* GET users listing. */


router.get('/', function(req, res, next) {
  res.render('admin/page-login' , {layout: 'admin-layout'} );
});


router.get('/adminHome', function(req, res, next) {

  res.render('admin/admin-home', { layout: 'admin-layout', admin: true });
});

router.get('/viewProducts', function(req, res, next) {
  res.render('admin/viewProducts' , {layout: 'admin-layout', admin: true });
});

router.get('/addProduct', function(req, res, next) {
  res.render('admin/addProduct' , {layout: 'admin-layout', admin: true });
});

router.get('/categories', function(req, res, next) {
  res.render('admin/categories' , {layout: 'admin-layout', admin: true });
});

router.get('/users', function(req, res, next) {
  res.render('admin/users' , {layout: 'admin-layout', admin: true });
});


router.get('/orders', function(req, res, next) {
  res.render('admin/orders' , {layout: 'admin-layout', admin: true });
});








module.exports = router;
