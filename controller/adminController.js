var express = require('express');
var adminHelpers = require('../helpers/admin-helpers');

module.exports = {

//login get n post -----------------------------------------------------------
    getLoginpage: function (req, res) {
        res.render('admin/page-login', { layout: 'admin-layout' })
      },
    
      postLoginpage: (req, res) => {
        adminHelpers.doLogin(req.body).then((response) => {
          if (response.status) {
            res.redirect('/admin/adminHome')
          } else {
            res.redirect('/admin')
          }
        })
      },
    


    
}