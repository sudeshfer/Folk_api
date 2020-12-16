//created by Hatem Suthura
const _ = require("underscore");
const { publicChatRoomModel } = require("../models/publicChatRoomModel");

const {
    PublicRoomMessageSchemaModel
} = require("../models/PublicRoomsMessagesModel");
//
module.exports = io => {
    io.of("/api/joinPublicRoom").on("connection", socket => {

        let roomId;
        socket.on("joinPublicRoom", async function(msg) {
            let objectValue = JSON.parse(msg);
            roomId = objectValue["roomId"];
            let user_name = objectValue["user_name"];
            let user_id = objectValue["user_id"];

            let room = await publicChatRoomModel.findById(roomId);
            room.lastMessage.users_see_message.push(userId);
            room.save();
            io.of("/api/chatRoomList").emit("updateChatRoomList");
            socket.join(roomId);

            var clientsInRoom = io.nsps["/api/joinPublicRoom"].adapter.rooms[roomId];
            var numClients =
                clientsInRoom === undefined ?
                0 :
                Object.keys(clientsInRoom.sockets).length;

            let w =
                '{"sender_name":"' + user_name + '", "numClients":"' + numClients + '"}';

            socket.to(roomId).emit("UserJoin", w);
        });

        socket.on("getNumOfClints", async msg => {
            var clientsInRoom = io.nsps["/api/joinPublicRoom"].adapter.rooms[msg];
            var numClients =
                clientsInRoom === undefined ?
                0 :
                Object.keys(clientsInRoom.sockets).length;
            socket.to(msg).emit("onNumOfClints", numClients);

        });


        socket.on("new_comment", async msg => {
            let objectValue = JSON.parse(msg);
            let message = objectValue["message"];
            let sender_id = objectValue["sender_id"];
            let sender_name = objectValue["sender_name"];
            let sender_img = objectValue["sender_img"];
            let room_id = objectValue["room_id"];
            let imagesource = objectValue["imagesource"];
            let createdAt = objectValue["createdAt"];

            let isReply = objectValue["isReply"];
            let replyTo = objectValue["replyTo"];
            let replyImageSource = objectValue["replyImageSource"];
            let replyToName = objectValue["replyToName"];

            let model = PublicRoomMessageSchemaModel({
                message: message,
                sender_id: sender_id,
                sender_name: sender_name,
                sender_img: sender_img,
                room_id: room_id,
                imagesource: imagesource,
                isReply: isReply,
                replyTo: replyTo,
                replyImageSource: replyImageSource,
                replyToName: replyToName
            });

            await model.save();

            let msgN = {
                users_see_message: [sender_id],
                message: message
            };
            await publicChatRoomModel.findByIdAndUpdate(room_id, {
                created: Date.now(),
                lastMessage: msgN
            });

            let w =
                '{"sender_id":"' + sender_id +
                '","sender_name":"' + sender_name +
                '","message":"' + message +
                '","sender_img":"' + sender_img +
                '","room_id":"' + room_id +
                '","imagesource":"' + imagesource +
                '","createdAt":"' + createdAt +
                '","isReply":"' + isReply +
                '","replyTo":"' + replyTo +
                '","replyToName":"' + replyToName +
                '","replyImageSource":"' + replyImageSource +
                '"}';

            socket.to(room_id).broadcast.emit("RoomMsgReceive", w);
        });

        socket.on("disconnect", socket => {
            console.log("a user is Disconnected from Public Room ");

        });
    });
};