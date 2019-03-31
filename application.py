import os

from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from helpers import nameCheck

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = [
    {"FreeForAll" : [
            { "name": "dan1",
              "date": "18/08",
              "msg": "Hey, how r u?"
            },
            { "name": "sarah1",
              "date": "19/08",
              "msg": "Hey, I'm great. u?",
            }
        ]
    }
]
names = []


@app.route("/")
def index():

    channelList = []

    # get names of channels
    for channel in channels:
        for key in channel:
            channelList.append(key)

    return render_template("index.html", channels=channelList)

# display name
@app.route("/displayname", methods=["POST"])
def displayname():

    name = request.form.get('name')

    check = nameCheck(name, names)

    if check:
        names.append(name)

    return jsonify({"unique": check, "names": names})


@app.route("/test1/<string:get>", methods=["GET"])
def test1(get):

    channelName = get

    return channelName

# Get channel
@app.route("/channel/<string:name>", methods=["GET"])
def channel(name):

    chat = ""
    success = False
    messages = False

    for channel in channels:
        for key in channel:
            if key == name:
                chat = channel
                success = True
                if channel[key]:
                    messages = True
                break
        if chat:
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

# messages
@socketio.on("send message")
def vote(data):
    message = data["message"]
    emit("announce message", {"message": message}, broadcast=True)
