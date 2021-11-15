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

/* TEST */

exports.DBUT = async (req, res, next) => {

    try {

        let dateToday = new Date().toLocaleDateString('fr-FR');

        let songArr = [
            {name: 'Sabaton - Into the Fire',
             url: 'https://youtu.be/wL49qlcziC8',
             acceptedAnswers: ['sabaton into the fire', 'into the fire sabaton', 'sabaton in the fire', 'in the fire sabaton', 'sabaton into fire', 'into fire sabaton']
            },
            {name: 'Sabaton - The Last Stand',
             url: 'https://youtu.be/8a0thYvYCNE',
             acceptedAnswers: ['sabaton the last stand', 'the last stand sabaton', 'sabaton last stand', 'last stand sabaton']
            }
        ];

        const playlist = new Playlist({
            name: 'Deuxième playlist de test',
            author: 'Encore Dark_JP',
            creationDate: dateToday,
            coverImgPath: './img/disc.jpg',
            songs: songArr
        });

        await playlist.save();
        res.status(201).json({message: 'Ça a marché incroyable'});

    } catch (err) {
        res.status(400).json({ message: 'Coup dur pour Guillaume :\n' + err })
    }
};

    // const playlistSchema = mongoose.Schema({
    //     name: { type: String, required: true },
    //     author: String,
    //     creationDate: String,
    //     coverImgPath: String,
    //     songs: [{
    //         name: String,
    //         url: String,
    //         acceptedAnswers: [String]
    //     }]
    // });

// exports.getProducts = async (req, res, next) => {
//     try {
//         let products = await Product.find();
//         res.status(200).json({ products })

//     } catch (err) {
//         res.status(400).json({ err });
//     }
// };

// exports.addProduct = async (req, res, next) => {

//     const BASE_URL = 'https://www.ldlc.com/fiche/';
//     const prdt_url = BASE_URL + req.params.id + '.html';

//     try {
//         /* Chercher si le produit est déjà dans la BD */
//         let prdt = await Product.findOne({ url: prdt_url });
//         if (prdt == null) {  // Il n'y est pas

//             const prdt = new Product({
//                 url: prdt_url
//             });

//             await prdt.save();
//             await updateProduct.updatePrdt(prdt_url);
//             res.status(201).json({message: 'Produit ajouté avec succès!'});

//         } else {  // Il y est déjà

//             res.status(404).json({ message: 'Ce produit a déjà été ajouté' })
//         }
//     } catch (err) {
//         res.status(400).json({ message: 'Une erreur est survenue du côté du serveur.' })
//     }
// };

// exports.deleteProduct = (req, res, next) => {

//     Product.deleteOne({_id: req.params.id})
//     .then(() => {
//         res.status(200).json({message: 'Produit supprimé.'});
//     })
//     .catch(err => res.status(400).json({ err }));

// };