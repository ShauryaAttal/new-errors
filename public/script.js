const socket = io("/");

const user = prompt("Enter your name: ");

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "433",
});

const myvideo = document.createElement("video");
myvideo.muted = true;

var mystream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    mystream = stream;
    addVideoStream(myvideo, stream);

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStrem) => {
        addVideoStream(video, userVideoStrem);
      });
    });
  });

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    $("#video_grid").append(video);
  });
}

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStrem) => {
    addVideoStream(video, userVideoStrem);
  });
}

$(function () {
  $("#show_chat").click(function () {
    $(".left-window").css("display", "none");
    $(".right-window").css("display", "block");
    $("#header_back").css("display", "block");
    console.log("check");
  });

  $("#header_back").click(function () {
    $(".right-window").css("display", "none");
    $(".left-window").css("display", "block");
    $("#header_back").css("display", "none");
  });

  $("#send").click(function () {
    if ($("#chat_message").val().length !== 0) {
      socket.emit("student", $("#chat_message").val());
      $("#chat_message").val("");
    }
  });

  $("#chat_message").keydown(function (e) {
    if (e.key == "Enter" && $("#chat_message").val().length !== 0) {
      socket.emit("student", $("#chat_message").val());
      $("#chat_message").val("");
    }
  });

  $("#mute_button").click(function () {
    const enabled = mystream.getAudioTracks()[0].enabled;
    if (enabled) {
      mystream.getAudioTracks()[0].enabled = false;
      html = `<i class = "fas fa-microphone-slash></i>`;
      $("#mute_button").toggleClass("background_red");
      $("#mute_button").html(html);
    } else {
      mystream.getAudioTracks()[0].enabled = true;
      html = `<i class = "fas fa-microphone></i>`;
      $("#mute_button").toggleClass("background_red");
      $("#mute_button").html(html);
    }
  });

  $("#stop_video").click(function () {
    const enabled = mystream.getVideoTracks()[0].enabled;
    if (enabled) {
      mystream.getVideoTracks()[0].enabled = false;
      html = `<i class = "fas fa-video-slash></i>`;
      $("#stop_video").toggleClass("background_red");
      $("#stop_video").html(html);
    } else {
      mystream.getVideoTracks()[0].enabled = true;
      html = `<i class = "fas fa-video></i>`;
      $("#stop_video").toggleClass("background_red");
      $("#stop_video").html(html);
    }
  });
});

peer.on("open", (roomId) => {
  socket.emit("join-room", ROOM_ID, roomId, user);
});
socket.on("createMessage", (message, userName) => {
  console.log("Client recv: ", message);
  $(".messages").append(
    ` <div class="message"> <b><i class="far fa-user-circle"></i> <span> ${
      userName === user ? "Me" : userName
    }</span> </b> <span>${message}</span> </div> `
  );
});
