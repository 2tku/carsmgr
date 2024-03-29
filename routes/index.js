var express = require('express');
var passport = require('passport');  
var router = express.Router();

/* GET home page. */
router.get('/', isLoggedIn, function(req, res, next) {
    // console.log('req.session.userRole' + req.session.passport.user.role);

    res.render('index', {
      title: 'GarageMgr', 
      author: '@gmail.com', 
      userRole: req.session.passport.user.role
    });
});

module.exports = router;

// Simple route middleware to ensure user is authenticated.
// function ensureAuthenticated(req, res, next) {
//   console.log('check authen');
//   if (req.isAuthenticated()) { return next(); }
//   req.session.error = 'Please sign in!';
//   res.redirect('/authen/signin');
// }
function isLoggedIn(req, res, next) {
  // console.log('check authen');
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/authen/login');
}