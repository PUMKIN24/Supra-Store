var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('user/user-home');
});

router.get('/login', function(req, res, next) {
  res.render('user/login');
});

router.get('/blog', function(req, res, next) {
  res.render('user/blog');
});

router.get('/cart', function(req, res, next) {
  res.render('user/cart');
});

router.get('/category', function(req, res, next) {
  res.render('user/category');
});

router.get('/checkout', function(req, res, next) {
  res.render('user/checkout');
});

router.get('/confirmation', function(req, res, next) {
  res.render('user/confirmation');
});

router.get('/contact', function(req, res, next) {
  res.render('user/contact');
});

router.get('/elements', function(req, res, next) {
  res.render('user/elements');
});


router.get('/single-post', function(req, res, next) {
  res.render('user/single-post');
});

router.get('/productDetails', function(req, res, next) {
  res.render('user/productDetails');
});

router.get('/tracking-copy', function(req, res, next) {
  res.render('user/tracking-copy');
});

router.get('/tracking', function(req, res, next) {
  res.render('user/tracking');
});

router.get('/blogDetails', function(req, res, next) {
  res.render('user/blogDetails');
});

router.get('/signUp', function(req, res, next) {
  res.render('user/signUp');
});














module.exports = router;
