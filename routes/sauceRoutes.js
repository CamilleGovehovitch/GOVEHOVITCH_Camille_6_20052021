const express = require('express');
const router = express.Router();

const sauceController = require('../controllers/sauceController');

router.get('/', sauceController.getAllSauce);
router.get('/:id', sauceController.getOneSauce);
router.post('/', sauceController.createSauce);
router.put('/:id', sauceController.modifyOneSauce);
router.delete('/:id', sauceController.deleteOneSauce);
router.post('/:id/like', sauceController.likeOneSauce);

module.exports = router;
