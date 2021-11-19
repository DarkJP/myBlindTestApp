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