// Handlebars templates
const channelTemplate = Handlebars.compile("<div class='channel'><div class='channelName'>{{ channel }}</div></div>");
const yourMessageTemplate = Handlebars.compile( '<div class="messageDetails yourMessageDetails">' +
                                                  '<div class="messageName">{{ name }}</div><div class="messageTime">{{ time }}</div>' +
                                                '</div>' +
                                                '<div class="messageBubbleContainer yourMessage">' +
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

  // Create new channel
  document.querySelector('#newChannelForm').onsubmit = () => {
    console.log("displayname submitted");
    document.querySelector('#newChannelButton').style.background = colour();
    const request = new XMLHttpRequest();
    const name = document.getElementById("newChannelInput").value;
    console.log("request opened, name: " + name);
    request.open('POST', '/newChannel');
    request.onload = () => {
      console.log("new channel request loaded")
      const data = JSON.parse(request.responseText);
      console.log(data);
      if (data.unique) {
        console.log("unique new channel: " + name);

        // Create new channel with Handelbars
        const channel = channelTemplate({'channel': name});
        const channelList = document.querySelector('.channels').innerHTML;
        document.querySelector('.channels').innerHTML = channel + channelList;
        // // Create new channel with vanilla JS
        // const newChannel = document.createElement('div');
        // newChannel.className = "channel";
        // const channelName = document.createElement('div');
        // channelName.className = "channelName";
        // channelName.innerHTML = name;
        // newChannel.appendChild(channelName);
        // document.querySelector('.channels').prepend(newChannel);

        // Display notification
        const notification = document.querySelector('.newChannelNotification');
        notification.innerHTML = "Created new channel";
        notification.classList.remove("errorMsg");
        notification.classList.add("newChannelSuccess");
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

  // on click set chat to selected channel
  document.querySelectorAll('.channel').forEach(channel => {
    channel.onclick = () => {
      // get clicked channel name
      const name = channel.firstChild.innerHTML;
      console.log(name);

      const request = new XMLHttpRequest();
      request.open('GET', `/channel/${name}`);
      request.onload = () => {
        const data = JSON.parse(request.responseText);
        if (data.success) {
          // If channel has pre exisitng messages, display those
          if (data.messages) {
            document.querySelector('#chat').innerHTML = data.chat[name][0].name;
          }
          else {
            document.querySelector('#chat').innerHTML = "This is the beginning of the (" + name + ") channel!";
          }
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
    };
  });

  // Send message
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  socket.on('connect', () => {
    document.querySelector('#messageForm').onsubmit= () => {
        const message = document.querySelector('#messageInput').value;
        document.querySelector('#messageInput').value = "";
        console.log(message);
        socket.emit('send message', {'message': message});
        console.log("message sent");
        return false;
    }
  });

  socket.on('announce message', data => {
    console.log("incomming message");
    const message = document.createElement('div');
    message.className = "message";
    message.innerHTML = yourMessageTemplate({"name": "alex", "time": "180891", "message": data.message});
    console.log(message);
    document.querySelector('#chat').append(message);
  });

});


// // change channel name
// function channelName(name) {
//   console.log("1");
//   const request = new XMLHttpRequest();
//   request.open('GET', `/test1/${name}`);
//   console.log("2");
//   request.onload = () => {
//     console.log("3");
//     const response = request.responseText;
//     document.getElementById("channelName").innerHTML = response;
//   };
//   request.send();
// }

// Generate random colour
function colour() {
  let x = Math.floor(Math.random() * 256);
  let y = Math.floor(Math.random() * 256);
  let z = Math.floor(Math.random() * 256);
  let col = "rgb(" + x + "," + y + "," + z + ")";
  return col;
}
