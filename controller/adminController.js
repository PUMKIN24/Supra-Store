var express = require('express');
var adminHelpers = require('../helpers/admin-helpers');

module.exports = {

//LOGIN -----------------------------------------------------------
    getLoginPage: function (req, res) {
        res.render('admin/page-login', { layout: 'admin-layout' })
      },
      
    
      postLoginPage: (req, res) => {
        adminHelpers.doLogin(req.body).then((response) => {
          if (response.status) {
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
      }
    
}