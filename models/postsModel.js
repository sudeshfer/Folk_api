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

const catSchema = new mongoose.Schema({
    catID: {
        type: String,
        required: true
    },
    catName: {
        type: String,
        required: true
    }
});


var postSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    post_data: {
        type: String,
        default: ''
    },

    has_img: {
        type: Boolean,
        required: true,
    },
    likes: {
        type: Number,
        default: 0
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    post_img: {
        type: String,
        default: null
    },
    isUserLiked: {
        type: Boolean,
        default: false
    },
    room_id: {
        type: String,
        default: 'default'
    },
    typology: {
        type: String,
        required: true
    },
    usersLiked: [{
        type: mongoose.Types.ObjectId,
        default: []
    }],
    geometry: GeoSchema,
    created: {
        type: Number,
        default: Date.now
    },
    exp_date: {
        type: Date,
        default: null
    },

    category: [catSchema],
}, {
    timestamps: true
});
var postSchemaModel = mongoose.model('posts', postSchema);
module.exports = {
    postSchemaModel,
}