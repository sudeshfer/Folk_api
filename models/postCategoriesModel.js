const mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
const Joi = require('joi');
const postcategory = new mongoose.Schema({
    iname: {
        type: String
    }
});

var postcategorySchema = new mongoose.Schema({
    itype: {
        type: String,
        required: true
    },
    postcategories: [postcategory]
});

postcategorySchema.plugin(uniqueValidator);
var postcategorySchemaModel = mongoose.model('postcategories', postcategorySchema);

module.exports = {
    postcategorySchemaModel,
}