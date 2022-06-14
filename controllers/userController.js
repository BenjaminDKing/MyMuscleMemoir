var User = require('../models/user')
var Workout = require('../models/workout');
const {body,validationResult} = require('express-validator');
const { DateTime } = require("luxon");
var async = require('async')
var bcrypt = require('bcryptjs')
var passport = require('passport')

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
  .isInt()
  .isLength({min: 1, max: 2})
  .withMessage("Invalid Height Feet Input"),

  body('heightInches')
  .isInt()
  .isLength({min: 1, max: 2})
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
