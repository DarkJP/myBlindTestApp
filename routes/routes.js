const express = require('express');
const controller = require('../controllers/controller');

const router = express.Router();

router.get('/', controller.getHomePage);
router.get('/playlists', controller.getPlaylists);
router.get('/playlists/:id', controller.getPlaylistById);
router.post('/add', controller.addPlaylist);
router.delete('/manage/deletePlaylist/:id', controller.deletePlaylist);
router.put('/manage/editPlaylist/:id', controller.editPlaylist);

module.exports = router;