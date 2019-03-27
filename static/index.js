document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#form').onsubmit = () => {
    console.log("submitted");
    var x = Math.floor(Math.random() * 256);
    var y = Math.floor(Math.random() * 256);
    var z = Math.floor(Math.random() * 256);
    var bgColor = "rgb(" + x + "," + y + "," + z + ")";
    document.querySelector('#btn').style.background = bgColor;
    const request = new XMLHttpRequest();
    const channel = document.getElementById("channel").value;
    request.open('POST', '/test');
    request.onload = () => {
      const data = JSON.parse(request.responseText);
      if (data.success) {
        const contents = data.channel;
        const el = document.getElementsByClassName("channelsHeadingText")[0];
        el.innerHTML = contents;
      }
      else {
        console.log("fail");
      }
    }
    const data = new FormData();
    data.append("channel", channel);

    request.send(data);
    return false;
  }

  document.querySelectorAll('.channel').forEach(channel => {
    channel.onclick = () => {
      let x = channel.firstChild.innerHTML;
      console.log("click " + x);
      channelName(channel.firstChild.innerHTML);
      return false;
    };
  });

  //   const chan = this.value;
  //
  //   const request = new XMLHttpRequest();
  //   const channel = chan;
  //   request.open('GET', '/test');
  //   request.onload = () => {
  //     const data = JSON.parse(request.responseText);
  //     if (data.success) {
  //       const contents = data.channel;
  //       document.getElementsByClassName("channelsHeadingText")[0].innerHTML = contents;
  //     }
  //     else {
  //       console.log("fail");
  //     }
  //   }
  //   const data = new FormData();
  //   data.append("channel", channel);
  //
  //   request.send("hellooo");
  //   return false;
  // });
});

function channelName(name) {
  console.log("1");
  const request = new XMLHttpRequest();
  request.open('GET', `/${name}`);
  console.log("2");
  request.onload = () => {
    console.log("3");
    const response = request.responseText;
    document.getElementsByClassName("channelsHeadingText")[0].innerHTML = response;
  };
  request.send();
}
