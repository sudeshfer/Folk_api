const mongoose = require('mongoose');

const instaAuth = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    user_token: {
        type: String,
        required: true
    }
});

var instaSchemaModel = mongoose.model('instaAuth', instaAuth);
module.exports = {
    instaSchemaModel,
}