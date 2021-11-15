/* Clic sur un bouton Supprimer */
$(document).on('click', '.btnDel', async function deletePlaylistClick() {
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