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
// Message limit
const limit = 100;
// Number of messages in each channel
var channelMessages = {};
// Display names that have been seen by a user and their corresponding comment colour
var users = {};
// channel background colour
const channelColour = "#6dffc7";

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
          channel.style.background = channelColour;
          document.getElementById("channelName").innerHTML = recentChannel;
          document.querySelector('body').style.background = colour();
        }
      });
    }
  }

  // form POST check new displayname
  document.querySelector('#displayNameForm').onsubmit = () => {
    const name = document.getElementById("displayNameInput").value;
    if (/\S/.test(name) === false) {
      return false;
    }
    const trim = name.trim();
    const stripped = trim.replace(/\s\s+/g, " ");
    const request = new XMLHttpRequest();
    request.open('POST', '/displayname');
    request.onload = () => {
      const data = JSON.parse(request.responseText);
      for (let i = 0, n = data.names.length; i < n; i++) {
      }
      if (data.unique) {
        localStorage.setItem("displayName", stripped);
        document.querySelector('.overlay').style.display = "none";
        document.querySelector('.displayName').style.display = "none";
        document.querySelector("#name").innerHTML = localStorage.getItem("displayName");
      }
      else {
        document.querySelector('.displayNameError').innerHTML = "Display Name Taken";
      }
    }
    const data = new FormData();
    data.append("name", stripped);

    request.send(data);
    return false;
  }

  // Socket io
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  socket.on('connect', () => {
    // Create new channel
    document.querySelector('#newChannelForm').onsubmit = () => {
      const name = document.querySelector('#newChannelInput').value;
      if (/\S/.test(name) === false) {
        return false;
      }
      document.querySelector('#newChannelButton').style.background = colour();
      const trim = name.trim();
      const remove = trim.replace(/[^\w\s/]/gi, '');
      const stripped = remove.replace(/\s\s+/g, " ");
      const request = new XMLHttpRequest();
      request.open('POST', '/newChannel');
      request.onload = () => {
        const data = JSON.parse(request.responseText);
        if (data.unique) {
        document.querySelector('#newChannelInput').value = "";
          // Display notification
          const notification = document.querySelector('.newChannelNotification');
          notification.innerHTML = "Created new channel";
          notification.classList.remove("errorMsg");
          notification.classList.add("newChannelSuccess");
          // Broadcast channel
          socket.emit('create channel', {"channel": stripped});
        }
        else {
          // Display notification;
          const notification = document.querySelector('.newChannelNotification');
          notification.innerHTML = "Channel already exists";
          notification.classList.remove("newChannelSuccess");
          notification.classList.add("errorMsg");
        }
      }
      const data = new FormData();
      data.append("newChannel", stripped);

      request.send(data);
      return false;
    }

    // Send message
    document.querySelector('#messageForm').onsubmit = () => {
        if (/\S/.test(document.querySelector('#messageInput').value) === false) {
          return false;
        }
        const channel = document.querySelector('#channelName').innerHTML;
        if (channel === "OpenChannels" || channel === "") {
          return false;
        }
        const message = document.querySelector('#messageInput').value;
        document.querySelector('#messageInput').value = "";
        const name = localStorage.getItem("displayName");
        socket.emit('send message', {'message': message, 'name': name, 'timeStamp': timeStamp(), "channel": channel});
        return false;
    }
  });

  // Receive channel
  socket.on("announce channel", data => {
      const name = data.channel;
      const id = name.replace(/\s/g, '-');
      // Create new channel with Handelbars
      const channel = channelTemplate({'channelId': id,'channel': data.channel});
      const channelList = document.querySelector('.channels').innerHTML;
      document.querySelector('.channels').innerHTML = channel + channelList;
  });

  // Receive message
  socket.on('announce message', data => {
    const channel = data.channel;
    const currentChannel = localStorage.getItem("currentChannel");
    if (currentChannel === channel) {
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
        channelMessages[channel] --;
      }
      channelMessages[channel] ++;
    }
    else {
      const id = channel.replace(/\s/g, '-');
      const notification = document.querySelector('#notifications' + id);
      notification.style.visibility = "visible";
      notification.style.transform = "translate(16px, -16px)";
      setTimeout(function() {
        notification.style.transform = "translate(16px, -10px)";
        setTimeout(function() {
          notification.style.transform = "translate(16px, -13px)";
          setTimeout(function() {
            notification.style.transform = "translate(16px, -10px)";
          }, 50)
        }, 100)
      }, 100)
      if (notification.innerHTML !== limit.toString()) {
        notification.innerHTML ++;
      }
    }
  });
});

// Actions when channel is clicked
function channelClicked(channel) {
  // get clicked channel name
  let name = channel.querySelector('.channelName').innerHTML;
  let stripped = name.replace(/\s/g, '-');
  const notification = document.querySelector('#notifications' + stripped);
  notification.style.visibility = "hidden";
  notification.innerHTML = 0;
  getChannel(name);
  // highlight and set channel name to selected channel
  document.querySelectorAll('.channel').forEach(channel => {
    channel.style.background = "";
  });
  channel.style.background = channelColour;
  document.getElementById("channelName").innerHTML = name;
  document.querySelector('body').style.background = colour();
  document.querySelector('#messageInput').focus();
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
    if (data.success) {
      chatBox.innerHTML = "This is the beginning of the (" + name + ") channel!";
      // If channel has pre exisitng messages, display those
      if (data.messages) {
        let len = data.chat.length
        channelMessages[name] = len;
        for (let i = 0; i < len; i++) {
          if (data.chat[i].name === localStorage.getItem("displayName")) {
            chatBox.innerHTML += yourMessageTemplate({"name": data.chat[i].name, "time": data.chat[i].time, "message": data.chat[i].msg});
          }
          else {
            let msgColour = "";
            if (!users[data.chat[i].name]) {
              users[data.chat[i].name] = colour();
            }
            msgColour = users[data.chat[i].name];
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
// function messageColour() {
//   let rgb = [0,0,0];
//   let brightness = 150;
//   let a = Math.floor(Math.random() * 3);
//   let b = Math.floor(Math.random() * 2);
//   let c = true;
//   if (b >= 1) {
//     c = false;
//   }
//   rgb[a] = brightness;
//   for (let i = 0; i < 3; i++) {
//     if (rgb[i] === 0) {
//       if (c) {
//         rgb[i] = Math.floor(Math.random() * brightness);
//         break;
//       }
//       else {
//         c = true;
//       }
//     }
//   }
//   let col = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
//   return col;
// }
