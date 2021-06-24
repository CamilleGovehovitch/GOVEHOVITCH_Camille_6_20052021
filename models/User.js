const mongoose = require('mongoose');

const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email:  {type: String, required: true, unique: true, trim: true},
    password: {type: String, required: true},
    role: {type: String, default: '1', enum: ["1", "4"]
       },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
