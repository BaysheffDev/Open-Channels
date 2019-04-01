# channels = [
#     {"alex" : [
#             { "name": "dan1",
#               "date": "18/08",
#               "msg": "Hey, how r u?"
#             },
#             { "name": "sarah1",
#               "date": "19/08",
#               "msg": "Hey, I'm great. u?",
#             }
#         ]
#     },
#     {"jonny" : [
#             { "name": "dan2",
#               "date": "20/08",
#               "msg": "Hey heyyyy!"
#             },
#             { "name": "sarah2",
#               "date": "21/08",
#               "msg": "Hey yooooo!",
#             }
#         ]
#     }
# ]
#
#
# channelList = []
#
# # get names of channels
# for channel in channels:
#     for key in channel:
#         channelList.append(channel[key])
#
# print(channelList)

channels = [
  {
    "new": [
      {
        "msg": "llll",
        "name": "alex",
        "time": "22:52 1/4"
      },
      {
        "msg": "",
        "name": "alex",
        "time": "22:52 1/4"
      },
      {
        "msg": "",
        "name": "alex",
        "time": "22:52 1/4"
      }
    ]
  },
  {
    "FreeForAll": [
      {
        "msg": "Hey, how r u?",
        "name": "dan1",
        "time": "18/08"
      },
      {
        "msg": "Hey, I'm great. u?",
        "name": "sarah1",
        "time": "19/08"
      }
    ]
  }
]

name = "FreeForAll"

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

print(success)
print(messages)
print(chat)

# return jsonify({"success": success, "messages": messages, "chat": chat})
#
#
# chat = ""
#
# for obj in channels:
#     for key, value in obj.items():
#         print(key)
#         print(value)
        # if key == "hey":
        #     if obj[key]:
        #         chat = value[0]['msg']
        #         print(chat)
        # print(key)
        # print(value)

# if channels[0]["name"]:
#     print(channels[0]["name"])
# else:
#     print("no good")
