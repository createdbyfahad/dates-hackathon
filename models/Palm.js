const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const constants = require('../constants');


const palmSchema = new mongoose.Schema({
    farmerID: String,
    type: {
        type: String,
        enum: constants.palmTypes, // palm types
        required: true
    },
    age: Number,
    location: {row: Number, column: Number},
    mapLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: false
        },
        coordinates: {
            type: [Number],
            required: false
        }
    },
    plantationDate: Date,
    harvest: [{
        date: Date,
        weight: Number,
        comment: String
    }],
    health: [{
        type: {
            type: String,
            enum: constants.palmHealth, // issue types
            required: true
        },
        startDate: Date,
        endDate: Date,
        comment: String
    }],
    barcode: String
}, { timestamps: true });

palmSchema.plugin(AutoIncrement, {inc_field: 'id'});

const Palm = mongoose.model('Palm', palmSchema);

module.exports = Palm;