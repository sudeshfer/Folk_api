"use strict";
//created by Hatem Suthura
const mongoose = require('mongoose');
const Joi = require('joi');

var commentlikeSchema = mongoose.Schema({
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

var commentlikeSchemaModel = mongoose.model('commentlikes', commentlikeSchema);
module.exports = {
    commentlikeSchemaModel,
}