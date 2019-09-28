const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment');
var QRCode = require('qrcode')

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
    health: [healthSchema]
}, { timestamps: true, toObject: { virtuals: true },
    toJSON: { virtuals: true } });


palmSchema.virtual('qrCode').get(async function(){
    // console.log("process.env.BASE_URL", process.env.BASE_URL)
    const url = constants.base_url + '/dashboard/farm/' + this.id;
    try{
        const code = await QRCode.toDataURL(url);
        return code;
    }catch{
        return false
    }
});

palmSchema.virtual('lastHarvest').get(function(){
    if(this.harvest.length == 0) return '';

    const harvest = this.harvest[this.harvest.length - 1];
    const m = moment(harvest.date);
    return m.format('MMMM Do YYYY, h:mm:ss a');
})

palmSchema.virtual('yearHarvestTotal').get(function(){
    if(this.harvest.length == 0) return '0';
    const today = new Date();
    const d = new Date(today.getFullYear(), 0, 0);
    var total = 0;
    for (let i = 0; i < this.harvest.length; i ++){
        const harvest = this.harvest[i];
        if(harvest.date > d){
            total += harvest.weight;
        }
    }
    return Math.round(total * 100) / 100;
})

palmSchema.virtual('lastYearHarvestTotal').get(function(){
    if(this.harvest.length == 0) return '0';
    const today = new Date();
    const d = new Date(today.getFullYear(), 0, 0);
    const lastd = new Date(today.getFullYear() - 1, 0, 0);
    var total = 0;
    for (let i = 0; i < this.harvest.length; i ++){
        const harvest = this.harvest[i];
        if(harvest.date > lastd && harvest.date < d){
            total += harvest.weight;
        }
    }
    return total;
});

palmSchema.virtual('compareYearHarvestTotal').get(function(){
    if(this.harvest.length == 0) return 0;
    const thisYear = new Date();
    thisYear.setFullYear(thisYear.getFullYear() - 1)
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 2)
    var thisYearTotal = 0;
    var lastYearTotal = 0;
    for (let i = 0; i < this.harvest.length; i ++){
        const harvest = this.harvest[i];
        if(harvest.date > thisYear){
            thisYearTotal += harvest.weight;
        }else if(harvest.date > lastYear){
            lastYearTotal += harvest.weight;
        }
    }
    let diff = thisYearTotal - lastYearTotal;
    let sign = Math.sign(diff);
    console.log("palm.location", this.location);
    console.log("thisYearTotal", thisYearTotal);
    console.log("lastYearTotal", lastYearTotal);
    console.log("sign", sign);
    if (lastYearTotal == 0) {
        lastYearTotal = 1
    }
    if(sign < 0){
        return -(Math.abs(diff) / lastYearTotal);
    }
    return Math.abs(diff) / lastYearTotal;
});

palmSchema.plugin(AutoIncrement, {inc_field: 'id'});


const Palm = mongoose.model('Palm', palmSchema);

module.exports = Palm;