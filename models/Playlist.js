const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema({
    name: { type: String, required: true },
    author: String,
    creationDate: String,
    coverImgPath: String,
    songs: [{
        name: String,
        url: String,
        acceptedAnswers: [String]
    }]
});

module.exports = mongoose.model('Playlist', playlistSchema);