const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment');

const constants = require('../constants');

const healthSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: constants.palmHealth, // issue types
        required: true
    },
    startDate: Date,
    endDate: Date,
    comment: String
}, {_id: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

healthSchema.virtual('length').get(function(){
    let d;
    let start = new moment(this.startDate);
    if(this.endDate){
        d = new moment(this.endDate);
    }else{
        d = new moment()
    }
    let diff = d.diff(start, 'months', true);
    return Math.round(diff);
})


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
    health: [healthSchema],
    barcode: String
}, { timestamps: true, toObject: { virtuals: true },
    toJSON: { virtuals: true } });


palmSchema.plugin(AutoIncrement, {inc_field: 'id'});


const Palm = mongoose.model('Palm', palmSchema);

module.exports = Palm;