var userHelpers = require('../helpers/user-helpers')
const { response } = require('express')




module.exports = {

//SIGNUP-----------------------------------------------------------------------------------------
    getSignUp: function (req, res) {
      res.render('user/signUp')
    },
  
    postSignUp: function (req, res) {
      userHelpers.doSignUp(req.body).then((data) => {
        console.log(data)
     })
    },

//LOGIN-----------------------------------------------------------------------------------------------
    getLogin: function (req, res) {
      res.render('user/login');
    },
    postLogin: async function (req, res) {
      userHelpers.doLogin(req.body).then((response) => {
        if (response.status) {
          req.session.loggedIn = true
          req.session.user = response.user;
          res.redirect('/')
        } else {
          res.redirect('/login')
        }
      })
    },

//HOMEPAGE----------------------------------------------------------------------------------------------
  getHomepage: async function (req, res) {
  userDetails = req.session.user
  if (userDetails) {
    res.render('user/user-home', { userDetails})
}  
  },


//LOGOUT -------------------------------------------------------------------------------------------
getLogout: function (req, res) {
  req.session.loggedIn = false
  req.session.user = null
  res.redirect('/')
},

}