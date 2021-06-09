const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true); //keep quiet the error message DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.

const userController = require('../controllers/userController');

router.post('/signup', userController.signup);
router.post('/login', userController.login);

module.exports = router;
