//created by Hatem Suthura
var mongoose = require('mongoose');


var publicChatRoomSchema = mongoose.Schema({
    users: [{
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'users',
        trim: true,
    }],
    admin_id: {
        type: mongoose.Types.ObjectId,
    },
    room_name: {
        type: String,
        max: 30,
        min: 5
    },
    img: {
        type: String,
        default: 'default-chat-room-image.jpg'
    },
    lastMessage: {
        users_see_message: [{
            type: mongoose.Types.ObjectId,
        }],

        message: {
            type: String,
            default: 'first msg'
        },
    },
    created: {
        type: Number,
        default: Date.now
    },
    blocked_users: [{
        type: String,
        ref: 'users',
        default: []
    }],
}, {
    timestamps: true
});

var publicChatRoomModel = mongoose.model('publicChatRooms', publicChatRoomSchema);

module.exports = {
    publicChatRoomModel,
}