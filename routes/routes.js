const express = require('express');
const controller = require('../controllers/controller');

const router = express.Router();

router.get('/', controller.getHomePage);
router.get('/playlists', controller.getPlaylists);
router.post('/add', controller.addPlaylist);
router.post('/dbut', controller.DBUT);
router.delete('/manage/deletePlaylist/:id', controller.deletePlaylist);
// router.get('/products', controller.getProducts);
// router.post('/add/:id', controller.addProduct);
// router.delete('/delete/:id', controller.deleteProduct);

module.exports = router;