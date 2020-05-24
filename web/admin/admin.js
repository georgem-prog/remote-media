var url = window.location.href;
var arr = url.split("/");
var result = arr[0] + "//" + arr[2]
var socket = io.connect(result + "/");

//page elements
var volSlider = document.getElementById("volume");
var btnPlaylistShuffleToggle = document.getElementById('btnPlaylistShuffle');

var pause = document.getElementById('pause');
pause.addEventListener("click", function() {
    socket.emit("serverPlayerControl", "pause");
})
var play = document.getElementById('play');
play.addEventListener("click", function() {
    socket.emit("serverPlayerControl", "play");
})

var prev = document.getElementById('prev');
prev.addEventListener("click", function() {
    socket.emit("serverQueueControl", "prev");
})
var skip = document.getElementById('skip');
skip.addEventListener("click", function() {
    socket.emit("serverQueueControl", "skip");
})

var emptyPlaylist = document.getElementById('emptyPlaylist');
emptyPlaylist.addEventListener("click", function() {
    socket.emit("serverQueueControl", "empty");
})

// Not currently used
// var mute = document.getElementById('1mute');
// mute.addEventListener("click", function() {
//   socket.emit("playerControl", "mute");
// })
// var unmute = document.getElementById('unmute');
// unmute.addEventListener("click", function() {
//   socket.emit("playerControl", "unmute");
// })

function send(){
    var val = document.getElementById("target").value;
    socket.emit("serverNewVideo",{value: val, pass: document.getElementById("password").value});
}

function sendAppend(){
    var val = document.getElementById("targetAppend").value;
    // var id = undefined;

    // const regex = /(?:\.be\/(.*?)(?:\?|$)|watch\?v=(.*?)(?:\&|$|\n))/ig;
    // let m;

    // while ((m = regex.exec(val)) !== null) {
    //     // This is necessary to avoid infinite loops with zero-width matches
    //     if (m.index === regex.lastIndex) {
    //         regex.lastIndex++;
    //     }
    
    //     // The result can be accessed through the `m`-variable.
    //     m.forEach((match, groupIndex) => {
    //         if (groupIndex == 0){
    //             return;
    //         }
    //         if (match == undefined){
    //             return;
    //         }
    //         // console.log(`Found match, group ${groupIndex}: ${match}`);
    //         socket.emit("targetAppend",{value: match, pass: document.getElementById("password").value});
    //     });
    // }
    socket.emit("targetAppend",{value: val, pass: document.getElementById("password").value});
}

function getTitle(data) {
    var feed = data.feed;
    var entries = feed.entry || [];
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var title = entry.title.$t;
        console.log(title);
    }
} 
 
 function vol(){
    socket.emit('volumeSend',volSlider.value);
 }
 
 function reloadClients(){
    socket.emit("serverConnectionManagement","reload");
 }
 
function disconnectClients(){
    socket.emit("serverConnectionManagement","discon");
}
 
socket.on("volumeRecv",function(data){
    volSlider.value = data;
    output.innerHTML = data;
})
 
function muteVid(){
    player.setVolume(0);
}
 
function speak(){
    var val = document.getElementById("speechBox").value;
    socket.emit("serverTTSRequest",{value: val, pass: document.getElementById("password").value});
}
    
// socket.on("playerinfo",function(data){
//     $('#data-table tr:last').after('<tr><td>'+ data.socketID  +'</td><td>'+ data.currentTime +'</td><td>'+ data.state +'</td></tr>');
// })

socket.on("adminClients",function(clients){
    // Get a reference to the table, and empty it
    let tableRef = document.getElementById("data-table-body");
    tableRef.innerHTML = "";

    console.log(clients);

    for (var client of clients){
        tableRef.innerHTML = tableRef.innerHTML + '<tr><td>'+ client.id +'</td><td>'+ client.status.state +'</td><td>'+ client.status.preloading +'</td></tr>';
    }
})

socket.on("playlistInfoObj",function(playlist){
    // Get a reference to the table, and empty it
    let tableRef = document.getElementById("playlist-table-body");
    tableRef.innerHTML = "";

    var i = 1;
    for (var video of playlist){
        console.log(video);
        // $('#playlist-table-body tr:last').after('<tr><td>'+ i +'</td><td>'+ video["id"] +'</td></tr>');
        tableRef.innerHTML = tableRef.innerHTML + '<tr><td>'+ i +'</td><td>'+ video["id"] +'</td></tr>';
        i++;
    }
})

socket.on("serverQueueVideos", function(queueData) {
    // Get a reference to the table, and empty it
    let tableRef = document.getElementById("playlist-table-body");
    tableRef.innerHTML = "";
    console.log(queueData)
    var videos = queueData.videos;
    if (videos.length > 0){
        var i = 1;
        for (var video of videos){
            console.log(video);
            var videoID = video.id;
            // $('#playlist-table-body tr:last').after('<tr><td>'+ i +'</td><td>'+ video["id"] +'</td></tr>');
            tableRef.innerHTML = tableRef.innerHTML + '<tr><td>'+ i +'</td><td>'+ videoID +'</td></tr>';
            i++;
        }
    }

    queueUpdateStatus(queueData);
})

function toggleShuffle(toggled){
    var newState = (toggled == 'false');  // Invert boolean from DOM
    socket.emit("serverQueueControl", "toggleShuffle")
}

socket.on("serverQueueStatus", function(status) {
    queueUpdateStatus(status);
})

function queueUpdateStatus(status){

    if (status.shuffle){
        btnPlaylistShuffleToggle.classList.add("active");
    } else {
        btnPlaylistShuffleToggle.classList.remove("active");
    }
    btnPlaylistShuffleToggle.ariaPressed = status.shuffle;
}