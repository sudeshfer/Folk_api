"use strict";
//created by Hatem Suthura
const mongoose = require('mongoose');
const Joi = require('joi');

var subcommentlikeSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'users',
        trim: true,
    },
    comment_id: {
        type: String,
        required: true,
        trim: true,
        ref: 'comments'
    },

    created: {
        type: Number,
        default: Math.floor(Date.now() / 1000)
    },
});

var subcommentlikeSchemaModel = mongoose.model('subcommentlikes', subcommentlikeSchema);
module.exports = {
    subcommentlikeSchemaModel,
}