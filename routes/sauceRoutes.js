const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const router = express.Router();

const sauceController = require('../controllers/sauceController');

router.get('/', sauceController.getAllSauce);
router.get('/:id', sauceController.getOneSauce);
router.post('/', multer, sauceController.createSauce);
router.put('/:id', sauceController.modifyOneSauce);
router.delete('/:id', auth, sauceController.deleteOneSauce);
// router.post('/:id/like', auth, sauceController.likeOneSauce);

module.exports = router;
