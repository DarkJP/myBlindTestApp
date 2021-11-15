const btn_create_playlist = document.getElementById('btn_create_playlist');
const input_create_pl_name = document.getElementById('input_create_pl_name');
const input_create_author = document.getElementById('input_create_author');
const input_create_songs = document.getElementById('input_create_songs');
const btn_create_playlist_confirm = document.getElementById('btn_create_playlist_confirm');
const btn_create_playlist_cancel = document.getElementById('btn_create_playlist_cancel');

btn_create_playlist.onclick = function createPlaylistClick() {
    opt_playlists.style.display = 'none';
    opt_create.style.display = 'block';
}

btn_create_playlist_confirm.onclick = function createPlaylistConfirm() {
    let plName = input_create_pl_name.value;
    let plAuthor = input_create_author.value;
    let plSongs = input_create_songs.value;

    if (!(plName == '' || plAuthor == '' || plSongs == '')) {

        let plObj = buildPlaylistObject(plName, plAuthor, plSongs);
        addPlaylist(plObj);

    } else {
        alert('Erreur. Champ(s) vide(s).');
    }
}

btn_create_playlist_cancel.onclick = function createPlaylistCancel() {
    opt_create.style.display = 'none';
    opt_playlists.style.display = 'block';
}

async function addPlaylist(plObj) {
    const serverAns = await fetch('/add', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(plObj)
    });
    const content = await serverAns.json();

    console.log(content);

    opt_create.style.display = 'none';
    opt_playlists.style.display = 'block';
    displayPlaylists();
}