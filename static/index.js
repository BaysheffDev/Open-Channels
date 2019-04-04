// Handlebars templates
const channelTemplate = Handlebars.compile('<div class="channel" onclick=channelClicked(this);>' +
                                            '<div id="notifications{{ channelId }}" class="messageNotification"></div>' +
                                            '<div class="channelName">{{ channel }}</div></div>');
const yourMessageTemplate = Handlebars.compile( '<div class="message">' +
                                                  '<div class="messageDetails yourMessageDetails">' +
                                                    '<div class="messageName">{{ name }}</div><div class="messageTime">{{ time }}</div>' +
                                                  '</div>' +
                                                    '<div class="messageBubbleContainer yourMessage">' +
                                                    '<div class="messageBubble">{{ message }}</div>' +
                                                  '</div>' +
                                                '</div>');

const messageTemplate = Handlebars.compile( '<div class="message">' +
                                              '<div class="messageDetails">' +
                                                '<div class="messageName">{{ name }}</div><div class="messageTime">{{ time }}</div>' +
                                              '</div>' +
                                              '<div class="messageBubbleContainer">' +
                                                '<div class="messageBubble" style="box-shadow: inset 0px -3px 10px 5px {{ colour }};">{{ message }}</div>' +
                                              '</div>' +
                                            '</div>');
const limit = 10;
var channelMessages = {};
var users = {};

document.addEventListener('DOMContentLoaded', () => {

  // prompt for display name if not in local localStorage
  if (localStorage.getItem("displayName")) {
    document.querySelector('.overlay').style.display = "none";
    document.querySelector('.displayName').style.display = "none";
    // Set display name on side bar
    document.querySelector("#name").innerHTML = localStorage.getItem("displayName");
    // Remember most recent channel
    let recentChannel = localStorage.getItem("currentChannel");
    if (recentChannel) {
      getChannel(recentChannel);
      // highlight and set channel name to recent channel
      document.querySelectorAll('.channel').forEach(channel => {
        channel.style.background = "";
        if(channel.querySelector('.channelName').innerHTML === recentChannel) {
          channel.style.background = "#6dffc7";
          document.getElementById("channelName").innerHTML = recentChannel;
          document.querySelector('body').style.background = colour();
        }
      });
    }
  }

  // form POST check new displayname
  document.querySelector('#displayNameForm').onsubmit = () => {
    if (/\S/.test(document.querySelector('#displayNameInput').value) === false) {
      return false;
    }
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
      if (/\S/.test(document.querySelector('#newChannelInput').value) === false) {
        return false;
      }
      console.log("channel submitted");
      document.querySelector('#newChannelButton').style.background = colour();
      let strip = document.getElementById("newChannelInput").value;
      let trim = strip.trim();
      const name = trim.replace(/\s\s+/g, " ");
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
    document.querySelector('#messageForm').onsubmit = () => {
        if (/\S/.test(document.querySelector('#messageInput').value) === false) {
          return false;
        }
        const channel = document.querySelector('#channelName').innerHTML;
        if (channel === "Power Channel") {
          console.log("You can't send messages in this channel, sorry.");
          return false;
        }
        const message = document.querySelector('#messageInput').value;
        document.querySelector('#messageInput').value = "";
        const name = localStorage.getItem("displayName");
        console.log(message);
        socket.emit('send message', {'message': message, 'name': name, 'timeStamp': timeStamp(), "channel": 'jd'});
        console.log("message sent");
        return false;
    }
  });

  // Receive channel
  socket.on("announce channel", data => {
      console.log("incomming channel");
      const name = data.channel;
      const id = name.replace(/\s/g, '-');
      // Create new channel with Handelbars
      const channel = channelTemplate({'channelId': id,'channel': data.channel});
      const channelList = document.querySelector('.channels').innerHTML;
      document.querySelector('.channels').innerHTML = channel + channelList;
  });

  // Receive message
  socket.on('announce message', data => {
    console.log("incomming message");
    const channel = data.channel;
    const currentChannel = localStorage.getItem("currentChannel");
    console.log("before cuirrentchannel checked");
    console.log(channel);
    console.log(currentChannel);
    if (currentChannel === channel) {
      console.log("after, true");
      // Get chat
      const chatBox = document.querySelector('#chat');
      if (data.name === localStorage.getItem("displayName")) {
        chatBox.innerHTML += yourMessageTemplate({"name": data.name, "time": data.timeStamp, "message": data.message});
      }
      else {
        chatBox.innerHTML += messageTemplate({"name": data.name, "time": data.timeStamp, "message": data.message});
      }
      // Stay scrolled to bottom
      chatBox.scrollTop = chatBox.scrollHeight;

      // Remove first message if "limit" messages in chat
      if (channelMessages[channel] === limit) {
        let msg = document.getElementById('chat');
        msg.removeChild(msg.children[0]);
        console.log("removed message?");
        console.log(msg.children[0].innerHTML);
        channelMessages[channel] --;
        console.log(channelMessages[channel]);
      }
      channelMessages[channel] ++;
      console.log(channelMessages[channel]);
    }
    else {
      console.log("after false");
      const notification = document.querySelector('#notifications' + channel);
      notification.style.visibility = "visible";
      if (notification.innerHTML !== limit.toString()) {
        console.log(notification.innerHTML);
        notification.innerHTML ++;
        console.log(notification.innerHTML);
      }
      console.log(limit);
    }
  });

});

// Actions when channel is clicked
function channelClicked(channel) {
  // get clicked channel name
  let name = channel.querySelector('.channelName').innerHTML;
  console.log(name);
  let stripped = name.replace(/\s/g, '-');
  const notification = document.querySelector('#notifications' + stripped);
  notification.style.visibility = "hidden";
  notification.innerHTML = 0;
  getChannel(name);
  // highlight and set channel name to selected channel
  document.querySelectorAll('.channel').forEach(channel => {
    channel.style.background = "";
  });
  channel.style.background = "#6dffc7";
  document.getElementById("channelName").innerHTML = name;
  document.querySelector('body').style.background = colour();
}

// Get channel
function getChannel(channelName) {
  const name = channelName;
  localStorage.setItem("currentChannel", name);
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
        let len = data.chat.length
        channelMessages[name] = len;
        console.log(channelMessages[name]);
        console.log("chat length: " + data.chat.length);
        for (let i = 0; i < len; i++) {
          if (data.chat[i].name === localStorage.getItem("displayName")) {
            console.log(data.chat[i].name);
            console.log(data.chat[i].time);
            console.log(data.chat[i].msg);
            chatBox.innerHTML += yourMessageTemplate({"name": data.chat[i].name, "time": data.chat[i].time, "message": data.chat[i].msg});
          }
          else {
            let msgColour = "";
            if (!users[data.chat[0].name]) {
              users[data.chat[0].name] = messageColour();
            }
            msgColour = users[data.chat[0].name];
            chatBox.innerHTML += messageTemplate({"name": data.chat[i].name, "time": data.chat[i].time, "message": data.chat[i].msg, "colour": msgColour});
          }
        }
      }
      else {
        channelMessages[name] = 0;
        chatBox.innerHTML = "This is the beginning of the (" + name + ") channel!";
      }
      // Scroll to bottom of chat
      chatBox.scrollTop = chatBox.scrollHeight;
      console.log("return true");
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

// Generate random colour at particular brightness level
function messageColour() {
  let rgb = [0,0,0];
  let brightness = 150;
  let a = Math.floor(Math.random() * 3);
  let b = Math.floor(Math.random() * 2);
  let c = true;
  if (b >= 1) {
    c = false;
  }
  rgb[a] = brightness;
  for (let i = 0; i < 3; i++) {
    if (rgb[i] === 0) {
      if (c) {
        rgb[i] = Math.floor(Math.random() * brightness);
        break;
      }
      else {
        c = true;
      }
    }
  }
  let col = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
  return col;
}
