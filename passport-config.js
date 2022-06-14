const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
var User = require('./models/user')


module.exports = initialize
