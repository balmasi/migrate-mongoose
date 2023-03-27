const mongoose = require('mongoose');

const { Schema } = mongoose;

// models/User.js
const UserSchema = new Schema({
    firstName: String,
    lastName: String,
  });
  
module.exports = mongoose.model('user', UserSchema);