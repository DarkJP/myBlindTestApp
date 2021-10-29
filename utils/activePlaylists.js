const playlists = [];

function addPlaylist(plObj) {
    playlists.push(plObj);
}

function getPlaylist(userId) {
    let plObj = null;
    for (let pl of playlists) {
        for (let p of pl.players) {
            if (p.id == userId) {
                plObj = pl;
            }
        }
    }
    return plObj;
}

function allPlayersHaveAnswered(plObj) {
    /* Filtrer le tableau des joueurs en ne gardant que ceux qui on répondu.
     * Si la taille de ce tableau est égale à la taille du tableau des joueurs,
     * c'est que tous les joueurs ont répondu. */
    return plObj.players.filter(p => p.hasAnswered).length == plObj.players.length;
}

function getAdminPlayer(plObj) {
    return plObj.players.filter(p => p.isAdmin)[0];
}

function resetRoundAnswers(plObj) {
    for (let p of plObj.players) {
        p.hasAnswered = false;
    }
}

function buildScoreObj(plObj) {
    let playerAnswers = [];
    for (let p of plObj.players) {
        playerAnswers.push({
            name: p.username,
            ans: p.lastAns,
            isCorrect: p.isLastAnsCorrect,
            score: p.score
        });
    }

    return {
        ans: plObj.songs[plObj.activeSongIndex].name,
        playerAns: playerAnswers
    };
}

function removePlaylist(room) {
    const index = playlists.findIndex(pl => pl.room == room);
    playlists.splice(index, 1);
}

module.exports = {
    addPlaylist,
    getPlaylist,
    allPlayersHaveAnswered,
    getAdminPlayer,
    resetRoundAnswers,
    buildScoreObj,
    removePlaylist
};

/*
Example Playlist Object

{
  id: new ObjectId("61689a3bbcfbdc3e1a29d4fc"),
  room: 'UwU',
  plName: 'Playlist de test',
  activeSongIndex: 0,
  songs: [
    {name: 'Sabaton - To Hell And Back',
     url: 'https://youtu.be/lj4O63Swowo',
     acceptedAnswers: [Array],
     _id: new ObjectId("61689a3bbcfbdc3e1a29d4fd")}
  ],
  players: [
    {id: '_VuikZkS9oCPZ3GpAAAD',
     username: 'Dark_JP',
     room: 'UwU',
     isAdmin: true,
     score: 0,
     hasAnswered: false}
  ]
}
*/