"use strict";
//created by Hatem Suthura
const mongoose = require('mongoose');
const Joi = require('joi');


var commentSchema = mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'users',
        trim: true,
    },
    user_name: {
        type: String,
        trim: true,
    },
    isUserLiked: {
        type: Boolean,
        default: false
    },
    comment: {
        type: String,
        trim: true,
    },
    user_img: {
        type: String,
        trim: true,
    },
    imagesource: {
        type: String
            // required:true
    },
    bday: {
        type: Date,
        required: true
    },
    post_id: {
        type: String,
        required: true,
        trim: true,
        ref: 'posts'
    },
    likes: {
        type: Number,
        default: 0
    },
    usersLiked: [{
        type: mongoose.Types.ObjectId,
        default: []
    }],
    created: {
        type: Number,
        default: Date.now
    },
}, {
    timestamps: true
});
var commentSchemaModel = mongoose.model('comments', commentSchema);
module.exports = {
    commentSchemaModel,
}