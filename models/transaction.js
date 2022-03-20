const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const customerSchema = new Schema({
    _Customerid: {
        type: Number,
        required: true      
    },
    EmailAddress: {
        type: String,
        required: true
    },
    FullName: {
        type: String,
       required: true
    },
    BearsFee: {
        type: Boolean,
        required: true
    },   
});

const paymentEntitySchema = new Schema({
    _PaymentEntityid: {
        type: Number,
        required: true
    },
    Issuer: {
        type: String,
        required: true
    },
    Brand: {
        type: String,
    },
    Number: {
        type: String,
        required: true
    },
    SixID: {
        type: Number,
        required: true
    },
    Type: {
        type: String,
        required: true
    },
    Country: {
        type: String,
        required: true
    }  
});

const transactionSchema = new Schema({
    ID: {
        type: Number,
        required: true
    },
    Amount: {
        type: Number,
        default: 'NGN'
    },
    Currency: {
        type: String,
        required: true
    },
    CurrencyCountry: {
        type: String,
        required: true
    },
   Customer: {
       type: customerSchema,

   },     
   PaymentEntity: {
       type: paymentEntitySchema
   },     
});

module.exports = mongoose.model('Transaction', transactionSchema);