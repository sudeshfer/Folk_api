"use strict";
//created by Hatem Suthura
const { roomsSchemaModel } = require("../models/conversionsModel");


const _ = require("underscore");
module.exports = {
    createChatRoom: async(req, res) => {
        const { user_one, user_two, lastMessage } = req.body;
        if (user_two && user_one && lastMessage) {
            let msg = {
                users_see_message: [user_one],
                message: lastMessage
            };

            let chat = await roomsSchemaModel.findOne({ users: { $all: [user_one, user_two] } });

            if (chat === null) {
                //create new Conversation
                const roomModel = new roomsSchemaModel({ users: [user_one, user_two], lastMessage: msg }, );

                roomModel.save(async err => {

                    if (err) {
                        res.send({ error: true, data: err })
                    } else {
                        res.send({ error: false, data: roomModel })
                    }
                });
            } else {
                //just send this message on this conversation and send Notification
                res.send({ error: false, data: chat })
            }
        } else {
            res.send({ error: true, data: 'missing some args user_one user_two lastMessage' })
        }

    },
    getUserChats: async(req, res) => {
        const userId = req.body.user_id;
        if (userId) {
            let listOfOnlineAndOffline = { "user 1 id ": true };
            const keys = Object.keys(listOfOnlineAndOffline);
            let result = {};
            try {
                let chats = await roomsSchemaModel.find({ users: userId }).sort({ updatedAt: -1 }).populate("users", "_id img user_name token");
                result.error = false;

                result.data = chats;

                result.onLineUsersId = keys;

                res.send({ error: false, data: result })
            } catch (error) {
                result.onLineUsersId = [];
                result.error = true;
                result.data = `there are error ${error}`;
                res.send({ error: true, data: result })
            }

        } else {
            res.send({ error: true, data: 'user_id is empty' })
        }
    },


};