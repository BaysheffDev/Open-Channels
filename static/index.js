// Handlebars templates
const channelTemplate = Handlebars.compile("<div class='channel' onclick=channelClicked(this);><div class='channelName'>{{ channel }}</div></div>");
const yourMessageTemplate = Handlebars.compile( '<div class="messageDetails yourMessageDetails">' +
                                                  '<div class="messageName">{{ name }}</div><div class="messageTime">{{ time }}</div>' +
                                                '</div>' +
                                                '<div class="messageBubbleContainer yourMessage">' +
                                                  '<div class="messageBubble">{{ message }}</div>' +
                                                '</div>');
const messageTemplate = Handlebars.compile( '<div class="messageDetails">' +
                                                  '<div class="messageName">{{ name }}</div><div class="messageTime">{{ time }}</div>' +
                                                '</div>' +
                                                '<div class="messageBubbleContainer">' +
                                                  '<div class="messageBubble">{{ message }}</div>' +
                                                '</div>');

document.addEventListener('DOMContentLoaded', () => {

  // prompt for display name if not in local localStorage
  if (localStorage.getItem("displayName")) {
    document.querySelector('.overlay').style.display = "none";
    document.querySelector('.displayName').style.display = "none";
    // Set display name on side bar
    document.querySelector("#name").innerHTML = localStorage.getItem("displayName");
  }

  // Highlight selected channel
  document.querySelectorAll(".channel").innerHTML = localStorage.getItem("displayName");

  // form POST check new displayname
  document.querySelector('#displayNameForm').onsubmit = () => {
    console.log("submitted");
    const request = new XMLHttpRequest();
    const name = document.getElementById("displayNameInput").value;
    request.open('POST', '/displayname');
    request.onload = () => {
      console.log("request loaded");
      const data = JSON.parse(request.responseText);
      for (let i = 0, n = data.names.length; i < n; i++) {
        console.log(data.names[i]);
      }
      if (data.unique) {
        console.log("unique new name: " + name);
        localStorage.setItem("displayName", name);
        document.querySelector('.overlay').style.display = "none";
        document.querySelector('.displayName').style.display = "none";
        document.querySelector("#name").innerHTML = localStorage.getItem("displayName");
      }
      else {
        console.log("Display name already exists!");
        document.querySelector('.displayNameError').innerHTML = "Display Name Taken";
      }
    }
    const data = new FormData();
    data.append("name", name);

    request.send(data);
    return false;
  }

  // Socket io
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  socket.on('connect', () => {
    // Create new channel
    document.querySelector('#newChannelForm').onsubmit = () => {
      console.log("channel submitted");
      document.querySelector('#newChannelButton').style.background = colour();
      const name = document.getElementById("newChannelInput").value;
      document.querySelector('#newChannelInput').value = "";
      const request = new XMLHttpRequest();
      request.open('POST', '/newChannel');
      request.onload = () => {
        const data = JSON.parse(request.responseText);
        if (data.unique) {
          // Display notification
          const notification = document.querySelector('.newChannelNotification');
          notification.innerHTML = "Created new channel";
          notification.classList.remove("errorMsg");
          notification.classList.add("newChannelSuccess");
          console.log("unique new channel: " + name + ". Socket.io'ing...");
          // Broadcast channel
          socket.emit('create channel', {"channel": name});
          console.log("channel broadcasted");
        }
        else {
          // Display notification
          console.log("Channel name already exists!");
          const notification = document.querySelector('.newChannelNotification');
          notification.innerHTML = "Channel already exists";
          notification.classList.remove("newChannelSuccess");
          notification.classList.add("errorMsg");
        }
      }
      const data = new FormData();
      data.append("newChannel", name);

      request.send(data);
      return false;
    }

    // Send message
    document.querySelector('#messageForm').onsubmit= () => {
        const channel = document.querySelector('#channelName').innerHTML;
        if (channel === "Power Channel") {
          console.log("You can't send messages in this channel, sorry.");
          return false;
        }
        const message = document.querySelector('#messageInput').value;
        document.querySelector('#messageInput').value = "";
        const name = localStorage.getItem("displayName");
        console.log(message);
        socket.emit('send message', {'message': message, 'name': name, 'timeStamp': timeStamp(), "channel": channel});
        console.log("message sent");
        return false;
    }
  });

  // Receeve channel
  socket.on("announce channel", data => {
      console.log("incomming channel");
      // Create new channel with Handelbars
      const channel = channelTemplate({'channel': data.channel});
      const channelList = document.querySelector('.channels').innerHTML;
      document.querySelector('.channels').innerHTML = channel + channelList;
  });

  // Receive message
  socket.on('announce message', data => {
    console.log("incomming message");
    const message = document.createElement('div');
    message.className = "message";
    if (data.name === localStorage.getItem("displayName")) {
      message.innerHTML = yourMessageTemplate({"name": data.name, "time": data.timeStamp, "message": data.message});
    }
    else {
      message.innerHTML = messageTemplate({"name": data.name, "time": data.timeStamp, "message": data.message});
    }
    console.log(message);
    document.querySelector('#chat').append(message);
  });

});

// Actions when channel is clicked
function channelClicked(channel) {
  // get clicked channel name
  const name = channel.firstChild.innerHTML;
  console.log(name);

  const request = new XMLHttpRequest();
  request.open('GET', `/channel/${name}`);
  request.onload = () => {
    const data = JSON.parse(request.responseText);
    // get chat
    const chatBox = document.querySelector('#chat');
    console.log("channel clicked and response loaded");
    if (data.success) {
      chatBox.innerHTML = "This is the beginning of the (" + name + ") channel!";
      // If channel has pre exisitng messages, display those
      if (data.messages) {
        for (let i = 0, len = data.chat.length; i < len; i++) {
          console.log(data.chat.length);
          if (data.chat[i].name === localStorage.getItem("displayName")) {
            console.log(data.chat[i].name);
            console.log(data.chat[i].time);
            console.log(data.chat[i].msg);
            chatBox.innerHTML += yourMessageTemplate({"name": data.chat[i].name, "time": data.chat[i].time, "message": data.chat[i].msg});
          }
          else {
            chatBox.innerHTML += messageTemplate({"name": data.chat[i].name, "time": data.chat[i].time, "message": data.chat[i].msg});
          }
        }
      }
      else {
        chatBox.innerHTML = "This is the beginning of the (" + name + ") channel!";
      }
      // Scroll to bottom of chat
      chatBox.scrollTop = chatBox.scrollHeight;

      // highlight and set channel name to selected channel
      document.querySelectorAll('.channel').forEach(channel => {
        channel.style.background = "";
      });
      channel.style.background = "#6dffc7";
      document.getElementById("channelName").innerHTML = name;
      document.querySelector('body').style.background = colour();
    }
    else {
      console.log("Request for channel failed");
    }
  }
  request.send();
}

// Timestamp
function timeStamp() {
  const time = new Date();
  const hour = time.getHours();
  const minute = time.getMinutes();
  const day = time.getDate();
  const month = time.getMonth() + 1;
  // const year = time.getFullYear();
  return hour + ":" + minute + " " + day + "/" + month;
}

// Generate random colour
function colour() {
  let x = Math.floor(Math.random() * 256);
  let y = Math.floor(Math.random() * 256);
  let z = Math.floor(Math.random() * 256);
  let col = "rgb(" + x + "," + y + "," + z + ")";
  return col;
}
