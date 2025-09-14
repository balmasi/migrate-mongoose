const mongoose = require('mongoose');
const User = require('./user.model');

mongoose.connect('mongodb://localhost:27017/mydb')

module.exports = {
    User
};