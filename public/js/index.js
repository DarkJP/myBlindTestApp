/* Homepage stuff */
const homepage_container = document.getElementById('homepage-container');
const inpt_username = document.getElementById('inpt_username');
const inpt_roomname = document.getElementById('inpt_roomname');
const btn_join_room = document.getElementById('btn_join_room');

/* Room stuff */
const room_container = document.getElementById('room-container');
const left = document.getElementById('left');
const middle = document.getElementById('middle');
const div_messages = document.getElementById('div_messages');

/* Messages stuff */
const inpt_msg = document.getElementById('inpt_msg');
const btn_send_msg = document.getElementById('btn_send_msg');

/* Playlists stuff */
const testsTitle = document.getElementById('tests-title');
const opt_playlists = document.getElementById('opt_playlists');
const btn_start_container = document.getElementById('btn_start_container');
let selectedPlaylistId;

const socket = io();

btn_join_room.onclick = function btnJoinRoomClick() {

    inpt_username.className = inpt_username.value == ''
                              ? 'form-control border-danger'
                              : 'form-control';
    inpt_roomname.className = inpt_roomname.value == ''
                              ? 'form-control border-danger'
                              : 'form-control';

    if (inpt_username.value != '' && inpt_roomname.value != '') {
        homepage_container.style.display = 'none';
        room_container.style.display = 'flex';

        /* Notifier le serveur de la connexion */
        socket.emit('joinRoom', {
            username: inpt_username.value,
            room: inpt_roomname.value
        });

        displayPlaylists();
    }
}

/* Écouter les messages de chat du serveur */
socket.on('message', msg => {
    console.log(msg);
    displayChatMessage(msg);
});

/* Écouter les messages d'infos sur la room du serveur */
socket.on('roomUsers', info => {
    console.log(info);
    displayRoomInfo(info);
});

/* Show start button only to room admin */
socket.on('admin', msg => {
    btn_start_container.innerHTML = '<button id="btn_start_test" class="btn btn-primary">Commencer le test</button>';
});

/* Envoi de messsage par la touche Entrée */
inpt_msg.addEventListener('keydown', function(e) {
    if (e.code == 'Enter') {
        sendMessage(inpt_msg.value);
    }
})

btn_send_msg.onclick = function btnSendMessageClick() {
    sendMessage(inpt_msg.value);
}

function sendMessage(message) {
    if (inpt_msg.value != '') {
        socket.emit('chatMessage', message);
        inpt_msg.value = '';
    }
}

function displayChatMessage(message) {
    let p = document.createElement('p');
    p.innerHTML = `<b>${message.username} :</b> ${message.msg}`
    div_messages.append(p);
    div_messages.scrollTop = div_messages.scrollHeight;
}

function displayRoomInfo(info) {
    left.innerHTML = '';

    let roomname = document.createElement('p');
    roomname.innerHTML = `<b>Nom de la partie :</b><br/>${info.room}`;
    left.append(roomname);

    let players = document.createElement('p');
    players.innerHTML = '<b>Joueurs connectés :</b>';
    left.append(players);

    for (let i = 0; i < info.users.length; i++) {
        let player = document.createElement('p');
        player.innerHTML = info.users[i].username;
        if (info.users[i].isAdmin) {
            player.style.color = 'gold';
        }
        left.append(player);
    }
}

async function displayPlaylists() {
    let DBData = await getPlaylists();
    let playlists = DBData.playlists;

    opt_playlists.innerHTML = '';

    for (let i = 0; i < playlists.length; i++) {

        let playlist_container = document.createElement('div');
        playlist_container.id = playlists[i]._id;
        playlist_container.className = 'playlist-container';

        let playlist_title = document.createElement('span');
        playlist_title.className = 'playlist-title fancy-font';
        playlist_title.innerHTML = playlists[i].name;

        playlist_container.append(playlist_title);
        playlist_container.append(document.createElement('br'));

        let createdBy = document.createElement('span');
        createdBy.innerHTML = '<b>Créée par :</b><br/>' + playlists[i].author;

        playlist_container.append(createdBy);
        playlist_container.append(document.createElement('br'));

        let dateLbl = document.createElement('span');
        dateLbl.innerHTML = '<b>Mise à jour le :</b><br/>' + playlists[i].creationDate;
        playlist_container.append(dateLbl);

        opt_playlists.append(playlist_container);
    }
}

/* Select a playlist */
$(document).on('click', '.playlist-container', function() {
    if (document.getElementById('btn_start_test') != null) {
        selectedPlaylistId = this.id;
        let others = document.getElementsByClassName('playlist-container');
        for (let e of others) {
            e.style.border = e.id == this.id ? '3px solid #4287f5' : '2px solid black';
        }
    }
})

$(document).on('click', '#btn_start_test', function() {
    if (selectedPlaylistId != null) {
        socket.emit('adminstartclick', selectedPlaylistId);
    }
});

/* Le serveur notifie le début de la partie */
socket.on('gamestart', () => {
    testsTitle.innerHTML = 'Blind Test en cours !'
    displayGameScreen();
});

function displayGameScreen() {
    opt_playlists.innerHTML = '';

    const gameContainer = document.createElement('div');

    let p = document.createElement('p');
    p.innerHTML = 'Votre réponse :';
    gameContainer.append(p);

    let input = document.createElement('input');
    input.id = 'inpt_answer';
    input.className = 'form-control';
    input.disabled = true;
    gameContainer.append(input);

    opt_playlists.append(gameContainer);
}

$(document).on('keydown', '#inpt_answer', function(e) {
    if (e.code == 'Enter') {
        socket.emit('answer', this.value);
        this.value = '';
        this.disabled = true;
    }
});

/* server sends a song */
socket.on('song', songURL => {
    displayGameScreen();
    $('#inpt_answer').prop('disabled', false);
    $('#inpt_answer').focus();
    btn_start_container.innerHTML = '';
    // Lancer la video
    let videoId = urlToId(songURL);

    console.log(`videoId: ${videoId}`);
    ytPlayer.loadVideoById(videoId, 0, "small");
    ytPlayer.playVideo();
});

function urlToId(url) {
    return url.indexOf('=') != -1
        ? url.substring(url.indexOf('=') +1)
        : url.substring(url.indexOf('.be/') +4);
}

socket.on('roundResult', res => {
    console.log('Résultats du round :');
    console.log(res);
    // Stop music ? Restart it ?
    opt_playlists.append(displayRoundScores(res));
});

function displayRoundScores(scoreObj) {
    opt_playlists.innerHTML = '';

    let container = document.createElement('div');

    let ansTitle = document.createElement('p');
    ansTitle.innerHTML = 'La réponse était :';
    let correctAns = document.createElement('p');
    correctAns.innerHTML = scoreObj.ans;

    let table = document.createElement('table');

    let thName = document.createElement('th');
    thName.innerHTML = 'Joueur';
    let thAns = document.createElement('th');
    thAns.innerHTML = 'Réponse';
    let thScore = document.createElement('th');
    thScore.innerHTML = 'Score';

    table.append(thName);
    table.append(thAns);
    table.append(thScore);
    for (let p of scoreObj.playerAns) {
        let tr = document.createElement('tr');

        let tdName = document.createElement('td');
        tdName.innerHTML = p.name;

        let tdAns = document.createElement('td');
        tdAns.innerHTML = p.ans;
        tdAns.style.color = p.isCorrect ? 'green' : 'red';

        let tdScore = document.createElement('td');
        tdScore.innerHTML = p.score;

        tr.append(tdName);
        tr.append(tdAns);
        tr.append(tdScore);
        table.append(tr);
    }

    container.append(ansTitle);
    container.append(correctAns);
    container.append(table);

    return container;
}

socket.on('adminNextBtn', res => {
    console.log('Showing Next button to admin');
    btn_start_container.innerHTML = '<button id="btn_next_song" class="btn btn-primary">Chanson suivante</button>';
});

/* Clic sur le bouton 'Chanson suivante' */
$(document).on('click', '#btn_next_song', function() {
    socket.emit('nextsong');
    btn_start_container.innerHTML = '';
});

/* Fin de partie */
socket.on('end', scores => {
    console.log('End of the test! Scores:');
    console.log(scores);
    /* pause video */
    ytPlayer.pauseVideo();

    testsTitle.innerHTML = 'Blind Test terminé !';
    opt_playlists.append(displayFinalScores(scores.playerAns));
    btn_start_container.innerHTML = '<button id="btn_back_home" class="btn btn-primary">Accueil</button>';
});

function displayFinalScores(scoreObj) {
    opt_playlists.innerHTML = '';

    let container = document.createElement('div');

    let ansTitle = document.createElement('p');
    ansTitle.innerHTML = 'Scores finaux :';

    let table = document.createElement('table');

    for (let p of scoreObj) {
        let tr = document.createElement('tr');

        let td = document.createElement('td');
        td.innerHTML = p.name + ' - ' + p.score;

        td.style.fontSize = scoreObj.indexOf(p) == 0
                            ? '2em' : scoreObj.indexOf(p) == 1
                            ? '1.6em' : scoreObj.indexOf(p) == 2
                            ? '1.3em' : '1em';

        tr.append(td);
        table.append(tr);
    }

    container.append(ansTitle);
    container.append(table);

    return container;
}

/* TODO
remove table borders from final scores
fix admin can't select playlists after back to home (also send other users back home)
*/

/* Clic sur le bouton 'Chanson suivante' */
$(document).on('click', '#btn_back_home', function() {
    displayPlaylists();
});

/* ------------------------------------------ */
/*             YouTube API stuff              */
/* ------------------------------------------ */

// load IFrame Player API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Create an <iframe> when API is ready
let ytPlayer;
function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('player', {
        height: '360',
        width: '640',
        videoId: 'Nlbrx4Wrko8',
        events: {
            'onReady': onPlayerReady,
        }
    });
    document.getElementById("player").style.display = 'none';
}

function onPlayerReady(event) {
    console.log("YT Player Ready");
}

/* ------------------------------------------ */
/*           Database related stuff           */
/* ------------------------------------------ */
async function getPlaylists() {
    try {
        let res = await fetch('/playlists', { method: 'GET' });
        let ans = await res.json();

        console.log(ans);
        return ans;

    } catch (err) {
        console.log(err);
    }
}

async function addPlaylist(name, author) {
    try {
        let res = await fetch('/add/' + name + '&' + author, { method: 'POST' });
        let ans = await res.json();

        let status = res.status;
        if (status == 201) {
            console.log('Succès : ' + ans.message);
        } else {
            console.log('Erreur : ' + ans.message);
        }
    } catch (err) {
        console.log(err);
    }
}

async function DBUT() {
    try {
        console.log('Sending Sample Test Data...');
        let promise = await fetch('/dbut', { method: 'POST' });
        let ans = await promise.json();
        console.log(ans);
        console.log('Done.');

    } catch (err) {
        console.log(err);
    }
}