const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstname:{
    type: String,
    required: [true, 'First name is required'],
  },
  lastname: {
    type: String,
  },
  email:{
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  userType: {
    type: String,
    required: [true, 'User type is required'],
    enum: ['guest', 'host'],
    default: 'guest',
  },
  favourite:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Home',
  }
});

module.exports = mongoose.model('User', userSchema);                