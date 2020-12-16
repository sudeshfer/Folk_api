"use strict";

const mongoose = require('mongoose');
const Joi = require('joi');


var subcommentSchema = mongoose.Schema({
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
    comment_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        trim: true,
        ref: 'comments'
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
var subcommentSchemaModel = mongoose.model('subcomments', subcommentSchema);
module.exports = {
    subcommentSchemaModel,
}