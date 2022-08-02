const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User'
        },
        code: {
            type: String
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
        link: {
            type: String
        },
        overPaymentThreshold: {
            type: Number
        },
        underPaymentThreshold: {
            type: Number
        },
        status: {
            type: String,
            default: 'charge created'
        },
        overPaidBy: {
            type: Number,
            default: 0
        },
        underPaidBy: {
            type: Number,
            default: 0
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
mongoose.model("Deposit", schema);