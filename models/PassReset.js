const mongoose = require('mongoose');

const PassResetSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    resetcode: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('PassReset', PassResetSchema);