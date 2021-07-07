const mongoose = require('mongoose');
// verifie que l'utilisateur a un email unique lors de l'inscription
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
    email:  {type: String, required: true, unique: true, trim: true},
    password: {type: String, required: true}
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
