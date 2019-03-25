document.addEventListener('DOMContentLoaded', () => {
  console.log("loaded...");
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
});
