"use strict";
//created by Hatem Suthura
const mongoose = require('mongoose');
const Joi = require('joi');

var userFollowSchema = mongoose.Schema({
    user_id: { //follower
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    peer_id: { //owner account
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },

    created: {
        type: Number,
        default: Math.floor(Date.now() / 1000)
    },
});

var UserFollowSchemaModel = mongoose.model('userfollows', userFollowSchema);
module.exports = {
    UserFollowSchemaModel,
}