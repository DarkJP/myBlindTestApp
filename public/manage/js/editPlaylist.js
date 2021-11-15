const opt_edit = document.getElementById('opt_edit');
const input_edit_pl_name = document.getElementById('input_edit_pl_name');
const input_edit_author = document.getElementById('input_edit_author');
const input_edit_songs = document.getElementById('input_edit_songs');
const btn_edit_playlist_confirm = document.getElementById('btn_edit_playlist_confirm');
const btn_edit_playlist_cancel = document.getElementById('btn_edit_playlist_cancel');

let currPlaylistId;

/* Clic sur un bouton Éditer */
$(document).on('click', '.btnEdit', function editPlaylistClick() {
    let plId = $(this).parent().attr('id');
    currPlaylistId = plId;
    displayEditSection(plId);
});

async function displayEditSection(plId) {
    opt_create.style.display = 'none';
    opt_playlists.style.display = 'none';
    opt_edit.style.display = 'block';

    let plObj = await getPlaylists(plId);
    playlist = plObj.playlist[0];

    input_edit_pl_name.value = playlist.name;
    input_edit_author.value = playlist.author;
    let songLine = '';
    for (let song of playlist.songs) {
        songLine += song.name + ';' + song.url + ';[';
        for (let accAns of song.acceptedAnswers) {
            songLine += accAns + ';';
        }
        songLine = songLine.slice(0, songLine.length -1);
        songLine += ']\n';
    }
    input_edit_songs.value = songLine.slice(0, songLine.length -1);
}

btn_edit_playlist_confirm.onclick = function editPlaylistConfirm() {
    let plName = input_edit_pl_name.value;
    let plAuthor = input_edit_author.value;
    let plSongs = input_edit_songs.value;

    if (!(plName == '' || plAuthor == '' || plSongs == '')) {

        let plObj = buildPlaylistObject(plName, plAuthor, plSongs);
        editPlaylist(plObj);

    } else {
        alert('Erreur. Champ(s) vide(s).');
    }
}

btn_edit_playlist_cancel.onclick = function editPlaylistCancel() {
    opt_edit.style.display = 'none';
    opt_playlists.style.display = 'block';
}

async function editPlaylist(plObj) {

    const serverAns = await fetch('editPlaylist/' + currPlaylistId, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(plObj)
    });

    const content = await serverAns.json();

    console.log(content);

    displayPlaylists();
}