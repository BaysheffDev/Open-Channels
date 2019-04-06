import os

from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from helpers import nameCheck

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = [
    {"OpenChannels" : [
            {
            "name": "BaysheffDev",
              "time": "17:30 02/04/2019",
              "msg": "Hi, welcome to OpenChannel."
            },
            {
            "name": "BaysheffDev",
              "time": "17:30 02/04/2019",
              "msg": "Create your own open channels to chat in, or chat in any channel of your choosing",
            },
            {
              "name": "BaysheffDev",
              "time": "17:30 02/04/2019",
              "msg": "I built this over a weekend so don't try too hard to break my shit. Enjoy!",
            }
        ]
    }
]
# List of display names
names = []
# message limit on channels
limit = 100

@app.route("/")
def index():

    channelList = []
    # get names of channels
    for channel in channels:
        for key in channel:
            channelList.append(key)

    return render_template("index.html", channels=channelList)

@app.route("/data", methods=["GET"])
def data():
    return jsonify(channels)

# display name
@app.route("/displayname", methods=["POST"])
def displayname():

    name = request.form.get('name')
    check = nameCheck(name, names)

    if check:
        names.append(name)

    return jsonify({"unique": check, "names": names})

# Get channel
@app.route("/channel/<string:name>", methods=["GET"])
def channel(name):

    success = False
    messages = False
    channelName = False
    chat = ""

    for channel in channels:
        for key, value in channel.items():
            if key == name:
                channelName = name
                success = True
                if channel[key]:
                    messages = True
                    chat = value
                break
        if channelName:
            break

    return jsonify({"success": success, "messages": messages, "chat": chat})

# Create channel
@app.route("/newChannel", methods=["POST"])
def newChannel():

    channelName = request.form.get("newChannel")
    check = True
    # check channel is unique
    for channel in channels:
        for key in channel:
            if key == channelName:
                check = False
                break
        if check == False:
            break
    if check == True:
        channels.insert(0, {channelName: []})

    return jsonify({"unique": check})


# Broadcast channel
@socketio.on("create channel")
def broadcastChannel(data):
    # Channel name
    name = data["channel"]
    emit("announce channel", {"channel": name}, broadcast=True)

# Broadcast messages
@socketio.on("send message")
def broadcastMessage(data):

    # Message details
    message = data["message"]
    name = data["name"]
    timeStamp = data["timeStamp"]
    # channel name
    channelName = data["channel"]

    for channel in channels:
        for key, value in channel.items():
            if key == channelName:
                if len(channel[key]) == limit:
                    channel[key].pop(0)
                value.append({"name": name, "time": timeStamp, "msg": message})

    emit("announce message", {"message": message, "name": name, "timeStamp": timeStamp, "channel": channelName}, broadcast=True)
