var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var {DateTime} = require('luxon')

const UserSchema = new Schema(
  {
    email: {type: String, required: true},
    password: {type: String, required: true},
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    date_of_birth: {type: Date, required: true},
    sex: String,
    weight: Number,
    height_feet: Number,
    height_inches: Number,
    personal_records: [
      {
        exercise_name: String,
        weight: Number,
      },
    ],
    date_joined: {type: Date, required: true},
  }
);

UserSchema
.virtual('full_name')
.get(function() {
  return this.first_name + " " + this.last_name
})

// UserSchema
// .virtual('height_formatted')
// .get(function() {
//     var height_formatted = {
//       height_feet: Math.floor(this.height / 12),
//       height_inches: (this.height % 12)
//     }
//     return height_formatted
// })

UserSchema
.virtual('dob_formatted')
.get(function() {
  return DateTime.fromJSDate(this.date_of_birth).toLocaleString();
})

UserSchema
.virtual('date_joined_formatted')
.get(function() {
  return DateTime.fromJSDate(this.date_joined).toLocaleString();
})

UserSchema
.virtual('age')
.get(function() {
    const now = DateTime.now()
    const dob = DateTime.fromJSDate(this.date_of_birth)

    const age = now.diff(dob, ["years"])
    return age
})

module.exports = mongoose.model('User', UserSchema);
