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

// User's own profile
router.get("/profile", user_controller.own_profile_get)

router.post("/profile", user_controller.own_profile_post)

router.get("/profile/edit", user_controller.profile_edit_get)

router.post("/profile/edit", user_controller.profile_edit_post)

// Accessing any user profile
router.get("/profile/:id", user_controller.user_profile_get)

router.post("/profile/:id", user_controller.user_profile_post)
// -------------------------- //

router.get("/one_rep_max_calculator", user_controller.one_rep_max_get)

router.post("/one_rep_max_calculator", user_controller.one_rep_max_post)

router.get("/log-out", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/access_denied", (req, res) => res.render("access_denied"))

// WORKOUT ROUTES

router.get("/workouts", workout_controller.list_workouts_get)

router.get("/workouts/log_workout", workout_controller.log_workout_get)

router.post("/workouts/log_workout", workout_controller.log_workout_post)

router.get("/workouts/:id", workout_controller.workout_details_get)

module.exports = router;
