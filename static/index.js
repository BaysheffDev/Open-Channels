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
    const channel = document.getElmentById("#channel");
    request.open('POST', '/test');
    console.log("step 1...");
    return false;
    request.onload = () => {
      console.log("start");
      return false;
      console.log("step 2...");
      const data = JSON.parse(request.responseText);
      if (data.success) {
        console.log("step 3...");
        return false;
        const contents = data.channel;
        document.getElementsByClassName(".channelsHeadingText").innerHTML = contents;
      }
      else {
        return false;
        console.log("fail");
      }
    }
    console.log("endd");
    return false;
    const data = new FormData();
    data.append("channel", channel);

    request.send(data);
    return false;
  }
});
