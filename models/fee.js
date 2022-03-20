const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const feeSchema = new Schema({
    fee_Id: {
        type: String,
        required: true
    },
    fee_Currency: {
        type: String,
        default: 'NGN'
    },
    fee_Locale: {
        type: String,
        required: true
    },
    fee_Entity: {
        type: String,
        required: true
    },
    entity_Property: {
        type: String,
        required: true
    },
    fee_Type: {
        type: String,
        required: true
    },
    fee_Value: {
        type: Number,
        required: false
    },
    flat_Value:{
        type: Number,
        required: false
    },
    perc_Value:{
        type: Number,
        required: false

    }


});

module.exports = mongoose.model('Fee', feeSchema);