const opt_playlists = document.getElementById('opt_playlists');
const opt_create = document.getElementById('opt_create');

/* Get playlists from DB */
async function getPlaylists(id) {
    try {

        let res = await fetch('/playlists' + (id == null ? '' : '/' + id), { method: 'GET' });
        let ans = await res.json();

        return ans;

    } catch (err) {
        console.log(err);
    }
}

async function displayPlaylists() {
    let plObj = await getPlaylists(null);

    opt_create.style.display = 'none';
    opt_edit.style.display = 'none';
    opt_playlists.style.display = 'block';
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

function buildPlaylistObject(plName, plAuthor, plSongs) {

    console.log(plSongs);

    let plObj = {
        name: plName,
        author: plAuthor,
        creationDate: new Date().toLocaleDateString('fr-FR'),
        songs: []
    };

    let songLines = plSongs.split('\n');

    console.log(songLines);

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

    return plObj;
}

displayPlaylists();