var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/index');
});

router.get('/signin', function(req, res, next) {
  res.render('admin/admin-login');
});

router.get('/signup', function(req, res, next) {
  res.render('admin/admin-signup');
});




module.exports = router;
