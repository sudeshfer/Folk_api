"use strict";
//created by Hatem Suthura
const mongoose = require('mongoose');


var notificationsSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    userImg: {
        type: String,
        required: true,
    },
    imagesource: {
        type: String
            // required:true
    },
    postId: {
        type: String,
        required: true,
    },
    notif_to_user: {
        type: String,
        required: true,
    },
    my_id: {
        type: String,
        required: true,
    },
    notificationType: {
        type: String,
    },
    notifMessage: {
        type: String,
        default: null
    },
    isread: {
        type: Boolean,
        default: false
    },
    created: {
        type: Number,
        default: Date.now
    },

}, {
    timestamps: true
});
var notificationsSchemaModel = mongoose.model('notifications', notificationsSchema);
module.exports = {
    notificationsSchemaModel,
}