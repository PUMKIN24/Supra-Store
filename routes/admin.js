var express = require('express');
var router = express.Router();

/* GET users listing. */


router.get('/', function(req, res, next) {
  res.render('admin/page-login' , {layout: 'admin-layout'});
});


router.get('/adminHome', function(req, res, next) {
  res.render('admin/admin-home' , {layout: 'admin-layout'});
});









module.exports = router;
