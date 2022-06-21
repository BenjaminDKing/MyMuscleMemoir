var User = require('../models/user')
var Workout = require('../models/workout');
const {body,validationResult} = require('express-validator');
const { DateTime } = require("luxon");
var async = require('async')
var bcrypt = require('bcryptjs')
var passport = require('passport')

// Sign-up GET handled on index.js router
exports.sign_up_post = [

  body('email')
  .isEmail().withMessage("Invalid Email Input"),

  body('password').trim()
  .isString()
  .isLength({ min: 8, max: 16})
  .not()
  .isLowercase()
  .not()
  .isUppercase()
  .not()
  .isNumeric()
  .not()
  .isAlpha()
  .withMessage("Invalid Password Input"),

  body('firstName')
  .isAlpha().not().isEmpty()
  .isLength({ max: 16 })
  .withMessage('Invalid First Name Input'),

  body('lastName')
  .isAlpha().not().isEmpty()
  .isLength({ max: 16 })
  .withMessage('Invalid Last Name Input'),

  body('dob')
  .isDate().not().isEmpty(),

  body('sex')
  .not().isEmpty(),

  body('weight')
  .isInt()
  .isLength({ max: 3, min: 2 })
  .withMessage("Invalid Weight Input"),

  body('heightFeet')
  .isInt({min: 1, max: 10})
  .isLength()
  .withMessage("Invalid Height Feet Input"),

  body('heightInches')
  .isInt({min: 0, max: 11})
  .isLength()
  .withMessage("Invalid Height Inches Input"),

  function(req, res, next) {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      res.render('sign-up', {errors: errors.array() })
      return
    }
    else {

      bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
        if (err) {return next(err)}
        const user = new User(

        {
          email: req.body.email,
          password: hashedPassword,
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          date_of_birth: req.body.dob,
          sex: req.body.sex,
          weight: req.body.weight,
          height_feet: req.body.heightFeet,
          height_inches: req.body.heightInches,
          personal_records: [],
          date_joined: DateTime.now(),
        }

      )
        .save(err => {
          if (err) {
            return next(err);
          }
          res.redirect("/");
        })
    });
  }
}]

exports.own_profile_get = function(req, res, next) {

  if( req.user ) {
    User.findById(req.user.id)
    .exec(function(err, user) {
      if (err) {return next(err)}
      res.render('own_profile', { user: user })
    })
  }
  else { res.redirect('/') }
}

exports.own_profile_post = []

exports.user_profile_get = function(req, res, next) {

  User.findById(req.params.id)
  .exec(function(err, user) {
    if (err) { return next(err) }
    res.render('any_profile', {user: user})
  })
}

exports.user_profile_post = []

exports.profile_edit_get = function(req, res, next) {

  if ( req.user ) {
    User.findById(req.user.id)
    .exec(function(err, user) {
      if (err) {return next(err)}
      res.render('edit_profile', { user: user})
    })
  }
  else {res.redirect('/')}
}

exports.profile_edit_post = [

  body("weight")
  .not().isEmpty().withMessage("Weight is required")
  .isInt({min: 1, max: 2000}).withMessage("Weight must be between 1 and 2000"),

  body("heightFeet")
  .not().isEmpty().withMessage("Height (feet) is required")
  .isInt({min:1, max:10}).withMessage("Height (feet) must be an integer value (1-10)"),

  body("heightInches")
  .not().isEmpty().withMessage("Height (inches) is required")
  .isInt({min:0, max:12}).withMessage("Height (feet) must be an integer value (1-10)"),

  body("prInput")
  .not().isEmpty().withMessage("Exercise name cannot be empty")
  .isAlphanumeric().withMessage("Exercise name must be alphanumeric"),

  body("prWeightInput")
  .not().isEmpty().withMessage("Exercise weight cannot be empty")
  .isInt({min: 0, max: 10000}).withMessage("Exercise weight must be an integer"),

  function(req, res, next) {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      res.render('edit_profile', {user: req.user, errors: errors.array() })
      return
    }
    else {

      var personal_records = []

      if (Array.isArray(req.body.prInput)) {
        for (var i =0; i < req.body.prInput.length; i++) {
          personal_records.push(
            {
              exercise_name: req.body.prInput[i],
              weight: req.body.prWeightInput[i],
            }
          )
        }
      }

      var user = new User(
        {
          _id: req.user.id,
          email: req.user.email,
          password: req.user.password,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          date_of_birth: req.user.date_of_birth,
          sex: req.body.sex,
          weight: req.body.weight,
          height_feet: req.body.heightFeet,
          height_inches: req.body.heightInches,
          personal_records: personal_records,
          date_joined: req.user.date_joined,
        }
      )

      User.findByIdAndUpdate(req.user.id, user, {}, function(err, theuser) {
        if (err) { return next(err) }
        res.redirect('/')
       })
    }
}]

exports.one_rep_max_get = function(req, res, next) {
  if (req.user) {
  res.render('one_rep_max_calculator', { user: req.user })}
  else {
    res.redirect('/')
  }
}

exports.one_rep_max_post = [

  body("calculation")
  .not().isEmpty().withMessage("1RM calculation required")
  .isInt().withMessage("1RM calculation must be an integer"),

  function(req, res, next) {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      res.render('one_rep_max_calculator', {user: req.user, errors: errors.array() })
      return
    }

    else {
      User.updateOne(
        { _id: req.user.id, "personal_records.exercise_name": req.body.lift },
        {
          $set: {
            "personal_records.$.weight": req.body.calculation
          }
        },
        function(err, theuser) {
          if(err) {return next(err)}
          res.redirect('/')
        }
      )
    }
  }
]
