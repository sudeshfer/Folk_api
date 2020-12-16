//created by Hatem Suthura
const _ = require("underscore");
const { roomsSchemaModel } = require('../models/conversionsModel');
const { publicChatRoomModel } = require('../models/publicChatRoomModel');
var mongoose = require('mongoose');

module.exports = io => {

    io.of("/api/chatRoomList").on('connection', (socket) => {

        socket.on("getConversionsList", async(id) => {


            const keys = Object.keys(io.onlineUsers);
            let result = {};
            try {
                let chats = await roomsSchemaModel.find({ users: id }).sort({ created: -1 }).populate("users", "_id img user_name token imagesource fb_url");

                result.error = false;
                result.data = chats;
                result.onLineUsersId = keys;
                console.log("****************************************");
                console.log(chats);
                console.log("****************************************");
                socket.emit('ConversionsListReady', result);
            } catch (error) {
                result.onLineUsersId = [];
                result.error = true;
                result.data = `there are error ${error}`;



                socket.emit('ConversionsListReady', result);

            }
        });


        socket.on("getChatRoomList", async(id) => {


            const keys = Object.keys(io.onlineUsers);
            let result = {};
            try {
                let chats = await publicChatRoomModel.find({ users: mongoose.Types.ObjectId(id) }).sort({ created: -1 }).populate("users", "_id img user_name token imagesource fb_url");

                result.error = false;
                result.data = chats;
                result.onLineUsersId = keys;
                console.log("*******///////////////////***********");
                console.log(chats);
                console.log("******////////////////////////***************");
                socket.emit('ChatListReady', result);
            } catch (error) {
                result.onLineUsersId = [];
                result.error = true;
                result.data = `there are error ${error}`;
                socket.emit('ChatListReady', result);
            }
        });


    });


};