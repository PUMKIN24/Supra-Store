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



// LOGIN PAGE ----------------------------------------------------------------
router.get('/',adminController.getLoginPage)

router.post('/',adminController.postLoginPage)

//  HOMEPAGE-----------------------------------------------------------------
router.get('/adminHome',adminController.getAdminHome) 


//  USERS--------------------------------------------------------------------
router.get('/users',adminController.getAllUsers)

router.get('/blockUser/:id',adminController.getBlockUser)

router.get('/unblockUser/:id', adminController.getUnblockUser)


// ADD PRODUCT--------------------------------------------------------------
router.get('/addProduct',adminController.getAddProduct)

router.post('/addProduct',uploads.array("image",3),adminController.postAddProduct)

//VIEW PRODUCTS------------------------------------------------------------
router.get('/viewProducts',adminController.getViewProducts)



// CATEGORIES--------------------------------------------------------------
router.get('/categories',adminController.getAddCategory)
router.post('/categories',adminController.addCategory)
router.get('/deleteCategory/:id',adminController.getDeleteCategory)


//  ORDERS-----------------------------------------------------------------------
// router.get('/orders', function(req, res, next) {
//   res.render('admin/orders' , {layout: 'admin-layout', admin: true });
// });


//  EDIT PRODUCT-------------------------------------------------------------------
// router.get('/editProduct', function(req, res, next) {
//   res.render('admin/editProduct' , {layout: 'admin-layout', admin: true });
// });









module.exports = router;
