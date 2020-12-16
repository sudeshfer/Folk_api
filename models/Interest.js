const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Joi = require('joi');
const interest = new mongoose.Schema({
    iname: {
        type: String
    }
});

var interestSchema = new mongoose.Schema({
    itype: {
        type: String,
        required: true
    },
    interests: [interest]
});
//
interestSchema.plugin(uniqueValidator);
var InterestSchemaModel = mongoose.model('interests', interestSchema);

module.exports = {
    InterestSchemaModel,
}