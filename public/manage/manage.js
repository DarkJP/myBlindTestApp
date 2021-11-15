console.log('UwU');

const opt_playlists = document.getElementById('opt_playlists');
const opt_create = document.getElementById('opt_create');

/* Playlist creation stuff */
const btn_create_playlist = document.getElementById('btn_create_playlist');
const input_create_pl_name = document.getElementById('input_create_pl_name');
const input_create_author = document.getElementById('input_create_author');
const input_create_songs = document.getElementById('input_create_songs');
const btn_create_playlist_confirm = document.getElementById('btn_create_playlist_confirm');
const btn_create_playlist_cancel = document.getElementById('btn_create_playlist_cancel');


/* Get playlists from DB */
async function getPlaylists() {
    try {
        let res = await fetch('/playlists', { method: 'GET' });
        let ans = await res.json();

        return ans;

    } catch (err) {
        console.log(err);
    }
}

async function displayPlaylists() {
    let plObj = await getPlaylists();

    opt_playlists.innerHTML = '';

    console.log(plObj);

    for (let p of plObj.playlists) {
        let plContainer = document.createElement('div');
        plContainer.id = p._id;
        plContainer.className = 'pl_container';

        let title = document.createElement('p');
        title.innerHTML = p.name + ' - ' + p.author;
        plContainer.append(title);

        let btnEdit = document.createElement('button');
        btnEdit.className = 'btn btn-primary btnEdit';
        btnEdit.innerHTML = 'Éditer';
        plContainer.append(btnEdit);

        let btnDel = document.createElement('button');
        btnDel.className = 'btn btn-danger btnDel';
        btnDel.innerHTML = 'Supprimer';
        plContainer.append(btnDel);

        opt_playlists.append(plContainer);
    }
}

/* Clic sur un bouton Éditer */
$(document).on('click', '.btnEdit', function() {
    let plId = $(this).parent().attr('id');
    displayEditSection(plId);
});

function displayEditSection(plId) {
    //
}

/* Clic sur un bouton Supprimer */
$(document).on('click', '.btnDel', async function() {
    let plId = $(this).parent().attr('id');
    let delMsg = 'Voulez-vous vraiment supprimer cette playlist ?';
    if (confirm(delMsg)) {
        let del = await fetch('deletePlaylist/' + plId, {method: 'DELETE'});
        if (del.status != 200) {
            console.log('Error when deleting the playlist.');
        }
        displayPlaylists();
    }
});

btn_create_playlist.onclick = function() {
    // opt_playlists.innerHTML = '';
    opt_playlists.style.display = 'none';
    opt_create.style.display = 'block';

    // nom de la playlist
    // auteur de la playlist
    // date trouvée auto
    // textarea -> songname;url;[accans1;accans2;accans3;accans4;accansN]
}

btn_create_playlist_confirm.onclick = function() {
    let plName = input_create_pl_name.value;
    let plAuthor = input_create_author.value;
    let plSongs = input_create_songs.value;

    if (!(plName == '' || plAuthor == '' || plSongs == '')) {

        let songLines = plSongs.split('\n');

        let plObj = {
            name: plName,
            author: plAuthor,
            creationDate: new Date().toLocaleDateString('fr-FR'),
            songs: []
        };

        for(let song of songLines) {
            let arrSplit = song.split(';');
            let currName = arrSplit[0];
            let currUrl = arrSplit[1];
            let currAccAns = (arrSplit[2].substring(1, arrSplit[2].length -1)).split(',');
            plObj.songs.push(
                {name: currName,
                 url: currUrl,
                 acceptedAnswers: currAccAns
                }
            );
        }

        addPlaylist(plObj);

    } else {
        alert('Erreur. Champ(s) vide(s).');
    }
}

btn_create_playlist_cancel.onclick = function() {
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


displayPlaylists();