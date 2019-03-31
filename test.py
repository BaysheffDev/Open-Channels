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

channels = {"name": [{"hehe": "lolol"}]}

if channels["name"]:
    print(channels)
else:
    print("no good")
