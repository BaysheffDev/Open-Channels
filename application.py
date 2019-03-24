import os

from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/test", methods=["POST"])
def test():

    data = request.form.get('channel')
    # obj = {
    #     "name": "data",
    #     "hobbie": "tennis"
    # }
    return jsonify({"success": True, "channel": data})
