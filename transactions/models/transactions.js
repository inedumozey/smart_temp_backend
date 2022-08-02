const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
        },
        code: {
            type: String,
        },
        link:  {
            type: String,
        },
        tradeAmountExpected: {
            type: Number
        },
        tradeAmountReceived: {
            type: Number
        },
        tradeCurrency: {
            type: String,
            default: 'USD'
        },
        nativeAmountExpected: {
            type: Number
        },
        nativeAmountReceived: {
            type: Number
        },
        currency: {
            type: String,
            default: 'SEC'
        },
        overPaymentThreshold: {
            type: Number,
        },
        underPaymentThreshold: {
            type: Number,
        },
        amountResolved: {
            type: Number,
            default: null
        },
        status: {
            type: String,
        },
        userId: {
            type: ObjectId,
            ref: 'User'
        },
        receiver: {
            type: ObjectId,
            ref: 'User'
        },
        referreeId: {
            type: ObjectId,
            ref: 'User'
        },
        transactionId: {
            type: String,
        },
        comment: {
            type: String,
            default: 'created'
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("Transactions", schema);