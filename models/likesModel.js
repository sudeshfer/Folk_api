"use strict";
//created by Hatem Suthura
const mongoose = require('mongoose');
const Joi = require('joi');

var likeSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    post_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'posts'
    },

    created: {
        type: Number,
        default: Math.floor(Date.now() / 1000)
    },
});

var likeSchemaModel = mongoose.model('likes', likeSchema);
module.exports = {
    likeSchemaModel,
}