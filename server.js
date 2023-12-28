const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const levenshtein = require('fast-levenshtein');

const formatMessage = require('./utils/formatMessage');
const { userJoin,
        getCurrentUser,
        userLeave,
        getRoomUsers,
        isFirstInRoom,
        setNextUserAdmin } = require('./utils/users');

const { addPlaylist,
        getPlaylist,
        allPlayersHaveAnswered,
        getAdminPlayer,
        resetRoundAnswers,
        buildScoreObj,
        removePlaylist } = require('./utils/activePlaylists');

const routes = require('./routes/routes');

const Playlist = require('./models/Playlist');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

mongoose.connect('<mongodb data base>',
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Successfuly connected to MongoDB'))
    .catch(() => console.log('Connection to MongoDB failed'));

app.use(bodyParser.json());

app.use('/', routes);

app.use(express.static('public'));

const BOTNAME = 'JP Bot';
const WELCOME_MESSAGE = 'Bienvenue ! Si l\'appli ne fonctionne pas bien, '
                        + 'plaignez-vous auprès de Dark_JP.';

// Run when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) => {

        /* Vérifier si l'utilisateur est le premier dans la room */
        let isAdmin = isFirstInRoom(room);

        /* Ajoute l'utilisateur à la liste */
        const user = userJoin(socket.id, username, room, isAdmin, 0, false, 'lastAns', false);

        socket.join(user.room);

        // Message de bienvenue automatique
        socket.emit('message', formatMessage(BOTNAME, WELCOME_MESSAGE));

        // Informet les autres utilisateurs de la salle que quelqu'un s'est connecté
        socket.broadcast.to(user.room)
        .emit('message', formatMessage(BOTNAME, `Nouvel utilisateur connecté : ${user.username}`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUsers(user.room)});

        if (user.isAdmin) {
            socket.emit('adminStartBtn');
        }

    });

    // Listen for chat messages
    socket.on('chatMessage', message => {

        const user = getCurrentUser(socket.id);

        // Send to everybody
        io.to(user.room).emit('message', formatMessage(user.username, message));
    });

    // Listen for admin starting game
    socket.on('adminstartclick', async playlistId => {

        const user = getCurrentUser(socket.id);

        // Get playlist info from DB
        let playlist = await Playlist.findOne({ _id: playlistId });

        // Get players in room
        let activePlayers = getRoomUsers(user.room);

        // Reset their scores
        for (let p of activePlayers) {
            p.score = 0;
        }

        // Build the playlist object
        let plObj = {
            id: playlist._id,
            room: user.room,
            name: playlist.name,
            activeSongIndex: 0, // Indicates what song to use in the song array. Incremented on 'nextsong' admin message
            songs: playlist.songs,
            players: activePlayers
        }

        addPlaylist(plObj);

        let message = 'La partie va commencer dans 5 secondes !';
        io.to(user.room).emit('message', formatMessage(BOTNAME, message));

        io.to(user.room).emit('gamestart');

        setTimeout(function () {
            io.to(user.room).emit('message', formatMessage(BOTNAME, 'C\'est parti !'));
            io.to(user.room).emit('song',
                {url: plObj.songs[plObj.activeSongIndex].url,
                 guessTime: plObj.songs[plObj.activeSongIndex].guessTime}
                );
        }, 5000);
    });

    // Réponse d'un joueur
    socket.on('answer', userAns => {
        let playerId = socket.id;
        // Trouver l'objet playlist dans lequel joue ce joueur
        let plObj = getPlaylist(playerId);
        if (plObj == null) {console.log('Erreur, le joueur n\'est dans aucune des playlists.');}

        // Trouver qui est ce joueur
        let player = plObj.players.find(p => p.id == playerId);

        // S'il n'a pas encore répondu
        if (!player.hasAnswered) {
            player.hasAnswered = true;
            player.lastAns = userAns;

            // Comparer sa réponse avec celles acceptées
            let acceptedAnswers = plObj.songs[plObj.activeSongIndex].acceptedAnswers;
            for (let answer of acceptedAnswers) {
                // Prendre en compte un ou deux fautes de frappes
                if (levenshtein.get(userAns, answer) <= 2) {
                    player.score++;
                    player.isLastAnsCorrect = true;
                    break;
                } else {
                    player.isLastAnsCorrect = false;
                }
            }
        }

        // Si tous les joueurs ont répondu
        if (allPlayersHaveAnswered(plObj)) {

            // Envoyer les résultats du round
            io.to(player.room).emit('roundResult', buildScoreObj(plObj));

            // Uniquement pour l'admin
            let admin = getAdminPlayer(plObj);
            io.to(admin.id).emit('adminNextBtn');

            // Réinitialiser les réponses
            resetRoundAnswers(plObj);
        }

    });

    // L'admin clique sur le bouton chanson suivante
    socket.on('nextsong', () => {
        let playerId = socket.id;
        // Trouver l'objet playlist dans lequel joue ce joueur
        let plObj = getPlaylist(playerId);
        if (plObj == null) {console.log('Erreur, le joueur n\'est dans aucune des playlists.');}

        if (plObj.activeSongIndex + 1 >= plObj.songs.length) {
            // Fin du test
            io.to(plObj.room).emit('end', buildScoreObj(plObj));

            // Envoyer le bouton retour accueil à l'admin
            let admin = getAdminPlayer(plObj);
            io.to(admin.id).emit('homeBtn');

        } else {
            plObj.activeSongIndex ++;
            io.to(plObj.room).emit('song',
                {url: plObj.songs[plObj.activeSongIndex].url,
                 guessTime: plObj.songs[plObj.activeSongIndex].guessTime}
            );
        }
    });

    socket.on('adminWentBackHome', () => {
        // Trouver l'objet playlist dans lequel joue ce joueur
        let plObj = getPlaylist(socket.id);

        // Envoyer un message à tout le monde dans la room
        io.to(plObj.room).emit('goBackHome');

        // Uniquement pour l'admin
        let admin = getAdminPlayer(plObj);
        io.to(admin.id).emit('adminStartBtn');

        // Supprimer la playlist des playlists actives
        removePlaylist(plObj.room);
    });

    // Lorsque que quelqu'un se déconnecte
    socket.on('disconnect', () => {
        // Trouver l'utilisateur qui s'est déconnecté
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(BOTNAME, `${user.username} s\'est déconnecté.`));

            /* S'il était admin, transférer les droits,
             * au joueur suivant, s'il y en a un */
            if (user.isAdmin && getRoomUsers(user.room).length != 0) {
                let newAdmin = setNextUserAdmin(user.room);
                io.to(user.room).emit('message', formatMessage(BOTNAME, `${newAdmin.username} est maintnant admin.`));
            }

            io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUsers(user.room)});
        }

    });

})

const PORT = 3000 || process.env.PORT;

server.listen(PORT);