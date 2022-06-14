var express = require('express');
var router = express.Router();
var passport = require('passport')
var User = require('../models/user')
var bcrypt = require('bcrypt')

// CONTROLLERS: //
var workout_controller = require('../controllers/workoutController')
var user_controller = require('../controllers/userController')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { user: req.user });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: true
  })
);

router.get("/sign-up", (req, res) => res.render("sign-up"));

router.post("/sign-up", user_controller.sign_up_post)

router.get("/log-out", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});


module.exports = router;
