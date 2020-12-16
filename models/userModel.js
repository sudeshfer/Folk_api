//created by Hatem Suthura
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Joi = require('joi');
const interestSchema = new mongoose.Schema({
    interestID: {
        type: String,
        required: true
    },
    interestName: {
        type: String,
        required: true
    }
});

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

var userSchema = mongoose.Schema({
    user_name: {
        type: String,
        max: 30,
        min: 5
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        max: 50,
        min: 5
    },
    followercount: {
        type: Number,
        default: 0
    },
    isUserFollowed: {
        type: Boolean,
        default: false
    },
    usersFollowed: [{
        type: mongoose.Types.ObjectId,
        default: []
    }],
    isUserRequested: {
        type: Boolean,
        default: false
    },
    isUserVerified: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    usersRequested: [{
        type: mongoose.Types.ObjectId,
        default: []
    }],

    token: { type: String, default: '' },
    gender: {
        type: String,
        required: true
    },
    bday: {
        type: Date,
        required: true
    },
    password: {
        type: String,
        // required: true,
        min: 6,
    },
    img: {
        type: String,
        default: 'default-user-profile-image.png'

    },
    img2: {
        type: String,
        default: 'default-user-profile-image.png'
    },
    img3: {
        type: String,
        default: 'default-user-profile-image.png'
    },
    img4: {
        type: String,
        default: 'default-user-profile-image.png'
    },
    img5: {
        type: String,
        default: 'default-user-profile-image.png'
    },
    img6: {
        type: String,
        default: 'default-user-profile-image.png'
    },
    bio: {
        type: String,
        default: "Hi I'am using Folk"
    },
    whatudo: {
        type: String,
        default: ""
    },

    phone: {
        type: String,
        required: true,
        min: 6
    },
    geometry: [GeoSchema],

    selectedlocation: {
        type: Number,
        default: 0
    },

    // base_64: {
    //     type: String,
    //     default: null
    // },

    fb_url: {
        type: String,
        default: null
    },
    imagesource: {
        type: String
            // required:true
    },

    base_64: {
        type: String,
        default: null
    },

    fb_url: {
        type: String,
        default: null
    },

    usertype: {
        type: String,
        default: 'user'
    },

    created: {
        type: Number,
        default: Date.now
    },
    interests: [interestSchema]

});
userSchema.plugin(uniqueValidator);
var userSchemaModel = mongoose.model('users', userSchema);

module.exports = {
    userSchemaModel,
}