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
        convertedAmount: {
            type: Number
        },
        currency: {
            type: String,
            default: 'SEC'
        },
        overPaidBy: {
            type: Number
        },
        underPaidBy: {
            type: Number
        },
        status: {
            type: String,
        },
        userId: {
            type: ObjectId,
            ref: 'User'
        },
        sender: {
            type: ObjectId,
            ref: 'User'
        },
        receiver: {
            type: ObjectId,
            ref: 'User'
        },
        accountNumber: {
            type: Number
        },
        transactionId: {
            type: String,
        },
        comment: {
            type: String,
        },
        walletAddress: {
            type: String,
        },
        coin: {
            type: String,
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("Transactions", schema);