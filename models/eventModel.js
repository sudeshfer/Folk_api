"use strict";
//created by Hatem Suthura
const mongoose = require('mongoose');
const Joi = require('joi');

const GeoSchema = new mongoose.Schema({
    pintype: {
        type: String,
        default: "Point"
    },
    coordinates: {
        type: [Number],
        index: "2dsphere"
    }
});

var eventSchema = mongoose.Schema({
    user_id: { //
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    title: { //
        type: String,
        required: true
    },
    post_data: { //
        type: String,
        default: ''
    },

    has_img: { //
        type: Boolean,
        required: true,
    },
    likes: {
        type: Number, //
        default: 0
    },
    joinedCount: {
        type: Number, //
        default: 0
    },
    post_img: { //
        type: String,
        default: null
    },
    isUserLiked: { //
        type: Boolean,
        default: false
    },
    isUserJoined: { //
        type: Boolean,
        default: false
    },
    typology: { //
        type: String,
        required: true
    },
    address: { //
        type: String,
        required: true
    },
    foodcategory: { //
        type: String,
        default: ""
    },
    minage: { //
        type: Number,
        required: true
    },
    maxage: { //
        type: Number,
        required: true
    },
    maxparticipants: { //
        type: Number,
        required: true
    },
    usersParticipating: [{
        type: mongoose.Types.ObjectId,
        default: []
    }],
    usersLiked: [{ //
        type: mongoose.Types.ObjectId,
        default: []
    }],
    geometry: GeoSchema, //
    created: { //
        type: Number,
        default: Date.now
    },
    event_date: { //
        type: Date,
        default: null
    },
    room_id: { //
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'publicChatRooms'
    }
}, {
    timestamps: true
});
var eventSchemaModel = mongoose.model('event', eventSchema);
module.exports = {
    eventSchemaModel,
}