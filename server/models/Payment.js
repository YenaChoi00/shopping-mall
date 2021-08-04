// const { Schema } = require('mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = mongoose.Schema({
    user:{
        type: Array,
        defult: []
    },
    data: {
        type: Array,
        default: []
    },
    product: {
        type: Array,
        default: []
    }

}, { timestamps: true })



const Payment = mongoose.model('payment', paymentSchema);

module.exports = { Payment }