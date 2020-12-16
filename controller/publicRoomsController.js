"use strict";
//created by Hatem Suthura
const Joi = require('joi');

const { publicChatRoomModel } = require('../models/publicChatRoomModel');


module.exports = {

    createRoom: async(req, res) => {

        let img;
        if (req.file)
            img = req.file.filename;
        const { room_name } = req.body;

        var roomModel;

        if (img) {
            roomModel = publicChatRoomModel({
                room_name: room_name,
                img: img
            });
        } else {
            roomModel = publicChatRoomModel({
                room_name: room_name,
            });
        }
        await roomModel.save(async err => {
            if (err) {
                res.status(500).json({
                    error: true,
                    data: "unknown error" + err,
                    chatId: []
                });
            } else {
                res.status(200).json({ error: false, data: roomModel });
            }
        });


    },

    getRooms: async(req, res) => {

        const rooms = await publicChatRoomModel.find().sort({ created: -1 });
        if (rooms.length === 0) {
            res.status(500).json({ error: true, data: "No rooms yet !" });
        } else {
            res.status(200).json({ error: false, data: rooms });
        }

    },

    getJoinedRooms: async(req, res) => {

        const { user_id } = req.body;

        let rooms = await publicChatRoomModel.findOne({ users: { $all: [user_id] } });

        // const rooms = await publicChatRoomModel.find().sort({ created: -1 });
        if (rooms.length === 0) {
            res.status(500).json({ error: true, data: "No rooms yet !" });
        } else {
            res.status(200).json({ error: false, data: rooms });
        }

    },


    deleteRoom: async(req, res) => {

        let id = req.body.roomId;
        await publicChatRoomModel.findByIdAndRemove(id);

        res.send({ error: false });



    }



};


function idValidation(id) {
    const schema = Joi.object().keys({
        user_id: Joi.required(),
    });
    return Joi.validate(id, schema);
}