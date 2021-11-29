const mongoose = require('mongoose');

const playlistSchema = mongoose.Schema({
    name: { type: String, required: true },
    author: String,
    creationDate: String,
    songs: [{
        name: String,
        url: String,
        guessTime: Number,
        acceptedAnswers: [String]
    }]
});

module.exports = mongoose.model('Playlist', playlistSchema);