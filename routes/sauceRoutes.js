const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const router = express.Router();

const sauceController = require('../controllers/sauceController');

router.get('/', auth, sauceController.getSauces);
router.get('/:id', auth, sauceController.getSauce);
router.post('/', auth, multer, sauceController.createSauce);
router.put('/:id', auth, multer, sauceController.modifySauce);
router.delete('/:id', auth, sauceController.deleteSauce);
router.post('/:id/like', auth, sauceController.likeOrDislikeSauce);

module.exports = router;
