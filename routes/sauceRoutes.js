const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const router = express.Router();

const sauceController = require('../controllers/sauceController');

router.get('/', auth, sauceController.getAllSauce);
router.get('/:id', auth, sauceController.getOneSauce);
router.post('/', auth, multer, sauceController.createSauce);
router.put('/:id', auth, multer, sauceController.modifyOneSauce);
router.delete('/:id', auth, sauceController.deleteOneSauce);
router.post('/:id/like', auth, sauceController.likeOneSauce);

module.exports = router;
