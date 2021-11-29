const room_container = document.getElementById('room-container');
const left = document.getElementById('left');
const middle = document.getElementById('middle');
const div_messages = document.getElementById('div_messages');

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

/* Écouter les messages d'infos sur la room du serveur */
socket.on('roomUsers', info => {
    displayRoomInfo(info);
});

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