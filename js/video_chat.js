// local user: us
// remote user: another person


// create Agora client: use web SDK 4.x
// mode: 'live' (only the host can talk and others cannot talk)
// mode: 'rtc' (real time communication; anyone can communicate)
// codec: how the video streams are sent. h264 or vp8
// agoraRTC is the entry point to use web SDKs. 
//.createclient creates a local client object for managing a call.

var client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "vp8"
});

// Create another variable called local tracks
// initally, no one has their cameras or microphone on.
// we need to join the channel before we access the camera or microphone

var localTracks = {
    videoTrack: null,
    audioTrack: null
};

// track the state for muting/unmuting video or audio

var localTrackState = {
    videoTrackEnabled: true,
    audioTrackEnabled: true
};

// empty dictionary because intially, no users will have joined
// we will add it when people join
var remoteUsers = {};

// Agora SDK needs these parameters in order to join the channel
// uid: User ID to identify a user in the channel. This should be unique. (string) At the start, it will be null since we dont expect any user to be joined.
// appID: app ID of our Agora project
// channel: this is the unique channel name for our call. Different sessions have different channels.
// token: unsecured method, so we can just write 'null'. If it secure, then we need to generate token from backend.
var options = {
    appID: "8ab5f718b8ec4035af14799e43ddb0df",
    uid: null,
    channel: null,
    token: null,
    name: null
};

// Join form
// we capture the text from join form in HTML to process it and use Agora SDK to activate video.
// use jquery, to call HTML tags
// start with $ and then '#' for ids and '.' for classes
// we can .preventDefault() to prevent page from refreshing.
// use async to make the function run independently or without synchronizing with other functions.
// async behavior of function tells another function to wait until this is executed. In our case, it will be the user join function which will wait before credentials are entered 


$("#join-form").submit(async function(e){
    e.preventDefault();
    console.log("Form Submitted");
    options.appID = options.appID;
    options.channel = $("#channel").val();
    await join();    
});

// Allows the user to join the channel
// setting the uid to null make agora set unique uid for every user.
// we are now calling Agora SDK to create a microphone and video access. We need to wait for audio, video to get from Agora SDK.
// await waits for the previous thing to get over.
// we set the video track to play to activate the html tag to play the video
// however, it wont play on the screen unless we publish it.
// object.values -> captures all the attributes of the local tracks.
async function join(){
    client.on("user-published", handleUserPublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);
    $("#leave").attr("disabled", false);
    $("#join").attr("disabled", true);
    $("#mute-audio").attr("disabled", false);
    $("#mute-video").attr("disabled", false);
    options.uid = await client.join(options.appID, options.channel, null, null);
    console.log("--------------------------------------------------");
    console.log("Joined and uid:", options.uid);
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
    localTracks.videoTrack.play("local-player");
    await client.publish(Object.values(localTracks));
    console.log("Published-----------------------------------------")
};

function handleUserJoined(user){
    console.log("-------------------------------------------------")
    console.log("User Joined");
    const id = user.uid;
    remoteUsers[id] = user;
    console.log(remoteUsers);
};

// remote user publishes an audio or video track
// SDK triggers this as a subscribe event
// subscription is different to publishing: each subscription can only subscribe to one audio or video track.
function handleUserPublished(user, mediaType){
    subscribeOthers(user, mediaType);
};

async function subscribeOthers(user, mediaType){
    // initiate the subscription
    const id = user.uid;

    await client.subscribe(user, mediaType);

    // if the subscribed track is an audio track, play audio, else play video.
    if (mediaType == "audio"){
        const audioTrack = user.audioTrack;
        audioTrack.play();
    }
    else{
        // we are creating a new div tag everytime.
        const videoTrack = user.videoTrack;
        const remotePlayer = $(`
        <div id="player-wrapper-${id}">
        <p class="player-name">Remote User:${id}</p>
        <div id="player-${id}" class="player-remote"></div>
        </div>
        `)
        $("#remote-playerlist").append(remotePlayer);
        videoTrack.play(`player-${id}`);
    }

};


function handleUserLeft(user){

    const id = user.uid;
    delete remoteUsers[id];
    $(`#player-wrapper-${id}`).remove();
    console.log("-------------------------------------------------")
    console.log("User Left");

};

// leave function defined by us. Different from agora method.
async function leave(){
    for(trackname in localTracks){
        var track = localTracks[trackname];
        if(track){
            track.stop();
            track.close();
            localTracks[trackname] = null;
        }
    }
    $("#remote-playerlist").html("")
    $("#join").attr("disabled", false);
    $("#leave").attr("disabled", true);
    $("#mute-audio").attr("disabled", true);
    $("#mute-video").attr("disabled", true);
    console.log("-----------------------------")
    console.log("User Left")
    await client.leave();
};

// setEnabled true turns it on and false turns it off.
async function muteAudio(){
    // We check if the audio is off to begin. If it is, then we just return nothing.
    if(! localTracks.audioTrack){
        return;
    }
    // Otherwise, we turn off the audio and just keep the video
    await localTracks.audioTrack.setEnabled(false);
    localTrackState.audioTrackEnabled = false;
    console.log("------------------------------------")
    console.log("Muted Video.")
    $("#mute-audio").text("Unmute Audio");
};

async function unmuteAudio(){
    // We check if the audio is off to begin. If it is, then we just return nothing.
    if(! localTracks.audioTrack){
        return;
    }
    // Otherwise, we turn off the audio and just keep the video
    await localTracks.audioTrack.setEnabled(true);
    localTrackState.audioTrackEnabled = true;
    console.log("------------------------------------")
    console.log("Unmuted Audio.")
    $("#mute-audio").text("Mute Audio");
};

async function muteVideo(){
    // We check if the audio is off to begin. If it is, then we just return nothing.
    if(! localTracks.videoTrack){
        return;
    }
    // Otherwise, we turn off the audio and just keep the video

    await localTracks.videoTrack.setEnabled(false);
    localTrackState.videoTrackEnabled = false;
    console.log("------------------------------------")
    console.log("Muted Video.")
    $("#mute-video").text("Unmute Video");
};

async function unmuteVideo(){
    // We check if the audio is off to begin. If it is, then we just return nothing.
    if(! localTracks.videoTrack){
        return;
    }
    // Otherwise, we turn off the audio and just keep the video
    await localTracks.videoTrack.setEnabled(true);
    localTrackState.videoTrackEnabled = true;
    console.log("------------------------------------")
    console.log("Unmuted Video.")
    $("#mute-video").text("Mute Video");
};


$("#leave").click(function(){
    leave();
});

$("#mute-audio").click(function(){
    if (localTrackState.audioTrackEnabled){
        muteAudio();
    }
    else{
        unmuteAudio();
    } 
});

$("#mute-video").click(function(){
    if (localTrackState.videoTrackEnabled){
        muteVideo();
    }
    else{
        unmuteVideo();
    } 
});










































// // Create Agora Client
// // mode: 'live' (only the host can talk and others cannot talk)
// // mode: 'rtc' (real time communication; anyone can communicate)
// // codec: how the video streams are sent. h264 or vp8
// //agoraRTC is the entry point to use web SDKs. 
// //.createclient creates a local client object for managing a call.
// var client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});

// // at the start, no one had their cameria/audio on by default. 
// // we need to join the channel to use the application.
// // null is needed to disable audio/video until user intends to. 
// var localTracks = {
//     videoTrack: null,
//     audioTrack: null
// };

// // empty dictionary: by default, we dont have remote users. only if they join
// var remoteUsers = {};

// // local variable which can be access
// // uid: user id generated by agora sdk. 
// // token: useful for testing. but for real one, we need to get token from backend.
// var options = {
//     appID: "061a1ebc8f6b4758b602299660abac68",
//     channel: null,
//     uid: null,
//     token: null
// };

// // Join Form
// // $("#join-form") comes from jquery. This means we can apply the js function to that html tag.
// // .submit: I want it to be submitted.
// // async: function works separately. This means we can have different functions working at the same time.
// // async awaits something to happen: we need to await function
// // await join(): We tell join function to wait until user types in a channel
// $("#join-form").submit(async function (e) {
//     e.preventDefault();
//     console.log("Form Submit");
//     options.appID = "061a1ebc8f6b4758b602299660abac68";
//     options.channel = $("#channel").val();
//     await join();
// });

// // i do not want to face an error, where all the code segments are executed together.
// // First, we need user to enter a channel name, and only after they enter, we establish the audio and video tracks
// // we enter the id of the html tag that plays the video. It wont work until the client publishes the values to agora API to play the video
// async function join() {
//     client.on("user-published", handleUserPublished);
//     client.on("user-left", handleUserLeft);
//     client.on("user-joined", handleUserJoined);
//     options.uid = await client.join(options.appID, options.channel, null, null);
//     localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
//     localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
//     localTracks.videoTrack.play("local-player");
//     await client.publish(Object.values(localTracks));
// }

// function handleUserPublished(user, mediaType) {
//     subscribe(user, mediaType);
// }

// function handleUserLeft(user, mediaType) {
//     subscribe(user, mediaType);
// }

// function handleUserJoined(user) {
//     console.log("------------------------");
//     console.log("User Joined");
//     const id = user.uid;
//     remoteUsers[id] = user;
// }




