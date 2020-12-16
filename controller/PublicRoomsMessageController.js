"use strict";
//created by Hatem Suthura

// message type 0 mean is only String in flutter ignore img field
// message type 1  mean is only Img in flutter ignore message field
const { PublicRoomMessageSchemaModel } = require("../models/PublicRoomsMessagesModel");

module.exports = {

    //limit of messages is 20 
    fetchAll: async(req, res, next) => {
        let results = {};
        const page = parseInt(req.body.page);
        const limit = parseInt("20");
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        let messages = await PublicRoomMessageSchemaModel
            .find({ room_id: req.body.room_id })
            .limit(limit)
            .skip(startIndex)
            .sort({ createdAt: -1 });

        if (messages.length === 0) {
            results.error = true;
            results.data = "No Messages yet";
            res.send(results);
        } else {
            let totalCommentCount = await PublicRoomMessageSchemaModel
                .find({ chat_id: req.body.chat_id })
                .countDocuments()
                .exec();
            results.totalCount = totalCommentCount;

            if (endIndex < totalCommentCount) {
                results.next = {
                    page: page + 1,
                    limit: limit
                };
            }

            if (startIndex > 0) {
                results.previous = {
                    page: page - 1,
                    limit: limit
                };
            }
            results.error = false;
            results.data = messages;
            res.send(results);
        }
    },


};