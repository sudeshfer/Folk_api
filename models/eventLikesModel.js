"use strict";
//created by Hatem Suthura
const mongoose = require('mongoose');
const Joi = require('joi');

var eventlikeSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'users',
        trim: true,
    },
    event_id: {
        type: String,
        required: true,
        trim: true,
        ref: 'event'
    },

    created: {
        type: Number,
        default: Math.floor(Date.now() / 1000)
    },
});

var EventlikeSchemaModel = mongoose.model('eventlikes', eventlikeSchema);
module.exports = {
    EventlikeSchemaModel,
}