var express = require('express');
var router = express.Router();
const multer = require('multer');
const adminController=require('../controller/adminController')



//MULTER --------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: "public/product-images",
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname);
  },
});

const uploads = multer({
  storage
});



// For Admin Session 
const verifyAdmin = ((req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin')
  }
})

const verifyLogout = ((req, res, next) => {
  if (req.session.admin) {
    res.redirect('/admin/adminHome')
    
  } else {
    next()  
  }
})





// LOGIN PAGE ----------------------------------------------------------------
router.get('/',adminController.getLoginPage)

router.post('/',  adminController.postLoginPage)

//  HOMEPAGE-----------------------------------------------------------------
router.get('/adminHome',verifyAdmin, adminController.getAdminHome) 


//  USERS--------------------------------------------------------------------
router.get('/users',verifyAdmin,adminController.getAllUsers)

router.get('/blockUser/:id',verifyAdmin,adminController.getBlockUser)

router.get('/unblockUser/:id',verifyAdmin, adminController.getUnblockUser)


// ADD PRODUCT--------------------------------------------------------------
router.get('/addProduct',verifyAdmin, adminController.getAddProduct)

router.post('/addProduct',uploads.array("image",3),verifyAdmin, adminController.postAddProduct)

//VIEW PRODUCTS------------------------------------------------------------
router.get('/viewProducts',verifyAdmin,adminController.getViewProducts)

//DELETE  PRODUCTS------------------------------------------------------------
router.get('/DeleteProduct/:id', verifyAdmin,adminController.getDeleteProduct)


//EDIT  PRODUCTS------------------------------------------------------------
router.get('/editProduct/:id',verifyAdmin, adminController.getEditProduct)
router.post('/editProduct/:id',uploads.array('image',3),verifyAdmin, adminController.postEditProduct)

// CATEGORIES--------------------------------------------------------------
router.get('/categories',verifyAdmin, adminController.getAddCategory)
router.post('/categories',verifyAdmin, adminController.addCategory)
router.get('/deleteCategory/:id',verifyAdmin, adminController.getDeleteCategory)




// LOGOUT
router.get('/logout', adminController.logout)


// ERROR PAGE
router.use(function (req, res, next) {
  next(createError(404));
});

router.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('admin/admin-error', { layout: 'admin-layout' });
})








module.exports = router;
