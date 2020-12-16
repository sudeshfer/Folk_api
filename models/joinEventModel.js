"use strict";
//created by Hatem Suthura
const mongoose = require('mongoose');
const Joi = require('joi');

var joinEventSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    //
    event_id: {
        type: mongoose.Types.ObjectId,
        trim: true,
        ref: 'event'
    },

    created: {
        type: Number,
        default: Math.floor(Date.now() / 1000)
    },
});

var joinEventSchemaModel = mongoose.model('joinedEvents', joinEventSchema);
module.exports = {
    joinEventSchemaModel,
}