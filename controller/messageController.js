"use strict";
//created by Hatem Suthura

// message type 0 mean is only String in flutter ignore img field
// message type 1  mean is only Img in flutter ignore message field
const { messageSchemaModel } = require("../models/messagesModel");

module.exports = {
    //limit of messages is 20 
    fetchAll: async(req, res, next) => {
        let results = {};
        const page = parseInt(req.body.page);
        const limit = parseInt("20");
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        let messages = await messageSchemaModel
            .find({ chat_id: req.body.chat_id })
            .limit(limit)
            .skip(startIndex)
            .sort({ createdAt: -1 })
            .select("message img message_type created sender_id receiver_id isDeleted note_duration isReply replyTo replyImageSource replyToName");

        if (messages.length === 0) {
            results.error = true;
            results.data = "No Messages yet";
            res.send(results);
        } else {
            let totalCommentCount = await messageSchemaModel
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

    uploadMessageImageOnly: async(req, res) => {
        let imgName = req.file.filename;

        res.send({ error: false, data: imgName });
    },


    deleteMessageById: async(req, res) => {

        try {
            await messageSchemaModel.findByIdAndUpdate(req.body.id, { isDeleted: 1 });

            res.send({ error: false, data: 'done' })
        } catch (err) {
            res.send({ error: true, data: `${err}` });
        }

    }
};