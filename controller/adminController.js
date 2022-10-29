var express = require('express');
var adminHelpers = require('../helpers/admin-helpers');

module.exports = {

//LOGIN -----------------------------------------------------------
    getLoginPage: function (req, res) {
        res.render('admin/page-login', { layout: 'admin-layout' })
      },
      
    
      postLoginPage: (req, res) => {
        console.log(req.body)
        adminHelpers.doLogin(req.body).then((response) => {

          if (response.status) {
            req.session.admin=true
            res.redirect('/admin/adminHome')
          } else {
            res.redirect('/admin')
          }
        })
      },
 
//HOME -----------------------------------------------------------

      getAdminHome:(req, res)=> {

        res.render('admin/admin-home', { layout: 'admin-layout', admin: true });
    
      },

//USERS -----------------------------------------------------------
      getAllUsers: (req, res)=> {
        adminHelpers.getAllUsers().then((allUsers)=>{

          res.render('admin/users' , {layout: 'admin-layout',allUsers, admin: true });
        })
      },


      getBlockUser: (req, res)=> {
        adminHelpers.blockUser(req.params.id)
        res.redirect('/admin/users')
      },

      getUnblockUser: (req,res)=>{
        adminHelpers.unBlockUser(req.params.id)
        res.redirect('/admin/users')
      },

//ADD PRODUCT -----------------------------------------------------------

      getAddProduct:async(req, res)=> {
        let allCategories=await adminHelpers.getCategory()
        res.render('admin/addProduct' , {layout: 'admin-layout', allCategories,admin: true });
      },

      postAddProduct:(req,res)=>{
      const images=[];
        for (i = 0; i < req.files.length; i++) {
          images[i] = req.files[i].filename;
        }
        req.body.images = images
        adminHelpers.insertProducts(req.body)
        res.redirect('/admin/addProduct')
      },

      //CATEGORY --------------------------------------------------------------------

      getAddCategory:(req, res)=>{
        adminHelpers.getCategory().then((allCategories)=>{
          res.render('admin/categories' , {layout: 'admin-layout',allCategories, admin: true });
        })
      },

      addCategory:(req,res)=>{
        adminHelpers.addCategory(req.body)
        res.redirect('/admin/categories')
      },

      getDeleteCategory: (req, res) => {
        adminHelpers.delCategory(req.params.id)
        res.redirect('/admin/categories')
      },

//VIEW PRODUCTS ----------------------------------------------------------------------
      getViewProducts:(req,res)=>{
        adminHelpers.getAllProducts().then((products)=>{
          res.render('admin/viewProducts',{layout: 'admin-layout',products,admin: true} )
        })
      },

//DELETE PRODUCTS ------------------------------------------------------------------

getDeleteProduct: function (req, res) {
  adminHelpers.deleteProduct(req.params.id)
  res.redirect('/admin/viewProducts')
},
    

getEditProduct: async (req, res) => {
  let fullCategories = await adminHelpers.getAllCategories();
  let productDetails = await adminHelpers.getProductDetails(req.params.id);
  for (i = 0; i < fullCategories.length; i++) {
    if (productDetails.Categories == fullCategories[i].category) {
      fullCategories[i].flag = true;
    }
  }

  res.render('admin/editProduct', { layout: 'admin-layout', admin: true, productDetails, fullCategories })
},

postEditProduct: (req, res) => {
  let id = req.params.id
  const editImg = []
  for (i = 0; i < req.files.length; i++) {
    editImg[i] = req.files[i].filename
  }
  req.body.images = editImg
  adminHelpers.editedProduct(id, req.body).then((oldImage) => {
    if (oldImage) {
      for (i = 0; i < oldImage.length; i++) {
        var oldImagePath = path.join(__dirname, '../public/admin/product-Images/' + oldImage[i])
        fs.unlink(oldImagePath, function (err) {
          if (err)
            return
        })
      }
    }
  })
  res.redirect('/admin/viewProducts')
},



logout: (req, res, next) => {
  try {
    req.session.adminLoggedIn = false
    req.session.admin = null
    res.redirect('/admin')
  } catch (error) {
    console.log(error, "logout");
    next(error)
  }
}


}