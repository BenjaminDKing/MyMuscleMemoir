var User = require('../models/user')
var Workout = require('../models/workout')
const {body,validationResult} = require('express-validator');
const { DateTime } = require("luxon");
var passport = require('passport')

// AUTHORIZATION:
// --GENERAL RULES:
// ----1. Redirect to Login if req.user == false.
// ----2. Redirect to access_denied if req.user != Workout.user.id

exports.list_workouts_get = function(req, res, next) {
  if (req.user) {
    Workout.find({ user: req.user.id })
      .exec(function(err, workout_list) {
        if (err) {return next(err)}
        res.render('workout_list', {workouts: workout_list, user: req.user})
      })
    }
  else {
    res.redirect('/')
  }
}

exports.log_workout_get = function(req, res, next) {
  if (req.user) {
  res.render('log_workout', {user: req.user})}
  else {
    res.redirect('/')
  }
}

exports.log_workout_post = [
  // IF REQ.USER
  // Non-authenticated individuals should not be able to post a workout or risk crashing the app
  body('dateInput')
    .not().isEmpty().withMessage('A workout date is required.')
    .isDate().withMessage('A workout date is required.'),

  body('workoutTypeInput')
    .not().isEmpty().withMessage('A workout type is required.'),

  body('durationInput')
    .not().isEmpty().withMessage('A workout length is required.')
    .isNumeric().withMessage('Duration must be a number in minutes'),

  body('exerciseNameInput')
    .not().isEmpty().withMessage('Exercise name is required'),

  body('weightInput')
    .not().isEmpty().withMessage('Weight amount is required')
    .isNumeric().withMessage('Weight must be an integer'),

  body('repsInput')
    .not().isEmpty().withMessage('Repetition quantity is required')
    .isNumeric().withMessage('Repetition quantity must be an integer'),

  body('rpeInput')
    .not().isEmpty().withMessage('Rate of Perceived Exertion required')
    .isNumeric().withMessage("RPE must be an integer"),

(req, res, next) => {

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    res.render('log_workout', { title: 'Workout Logger', errors: errors.array() })
    return
  }

  else {

    var exercisesArr = []

    // if multiple exercises input, loop through them to get values
    if (Array.isArray(req.body.exerciseNameInput)) {
      for (var i = 0; i < req.body.exerciseNameInput.length; i++) {
        exercisesArr.push(
        {
          exercise_name: req.body.exerciseNameInput[i],
          weight: req.body.weightInput[i],
          reps: req.body.repsInput[i],
          rpe: req.body.rpeInput[i],
        })
      }
    }
    // else if just one exercise input, push by name
    else {
      exercisesArr.push(
        {
          exercise_name: req.body.exerciseNameInput,
          weight: req.body.weightInput,
          reps: req.body.repsInput,
          rpe: req.body.rpeInput,
        }
      )
    }

    var workout = new Workout(
      {
        user: req.user.id,
        date: req.body.dateInput,
        type: req.body.workoutTypeInput,
        duration_in_minutes: req.body.durationInput,
        exercises: exercisesArr,

        notes: req.body.notesInput
      })

    workout.save(function(err) {
      if (err) {return next(err)}
      // Successful? Then redirect to the workout's log
      res.redirect(workout.url)
    })
  }
}
]

exports.workout_details_get = function(req, res, next) {
  if (req.user) {
  Workout.findById(req.params.id)
    .populate('user')
    .exec(function (err, workout) {
      if (err) {return next(err)}
      if (workout.user.id === req.user.id) {
        res.render('workout_detail', {workout: workout, user: workout.user})}
    })
  }
  else {
    res.redirect('/')
  }
}
