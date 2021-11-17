const path = require('path');
const Playlist = require('../models/Playlist');

exports.getHomePage = (req, res, next) => {
    res.sendFile(path.join(__dirname, './../public', 'index.html'));
};

exports.getPlaylists = async (req, res, next) => {
    try {
        let playlists = await Playlist.find();
        res.status(200).json({ playlists })

    } catch (err) {
        res.status(400).json({ err });
    }
};

exports.getPlaylistById = async (req, res, next) => {
    try {
        let playlist = await Playlist.find({ _id: req.params.id });
        res.status(200).json({ playlist })

    } catch (err) {
        res.status(400).json({ err });
    }
};

exports.addPlaylist = async (req, res, next) => {

    try {

        const playlist = new Playlist({...req.body});

        await playlist.save();
        res.status(201).json({message: 'Playlist ajoutée avec succès!'});

    } catch (err) {
        res.status(400).json({ message: 'Une erreur est survenue du côté du serveur.' })
    }
};

exports.deletePlaylist = async (req, res, next) => {

    try {

        await Playlist.deleteOne({ _id: req.params.id });
        res.status(200).json({message: 'Playlist supprimée.'});

    } catch (err) {
        res.status(400).json({ message: 'Une erreur est survenue du côté du serveur.' })
    }
};

exports.editPlaylist = async (req, res, next) => {

    try {
        await Playlist.updateOne({ _id: req.params.id }, {...req.body, _id: req.params.id});
        res.status(200).json({message: 'Playlist modifiée.'});

    } catch (err) {
        res.status(400).json({ message: 'Une erreur est survenue du côté du serveur.' })
    }
}