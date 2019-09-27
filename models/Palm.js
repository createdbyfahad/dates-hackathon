const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const palmSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [''], // palm types
        required: true
    },
    age: Number,
    location: {row: Number, column: Number},
    mapLocation: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
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
            enum: [''], // issue types
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