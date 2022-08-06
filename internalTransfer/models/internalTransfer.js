const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        sender: {
            type: ObjectId,
            ref: 'User'
        },
        receiver: {
            type: ObjectId,
            ref: 'User'
        },
        status: {
            type: String
        },
        accountNumber: {
            type: String
        },
        amount: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'SEC'
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("InternalTransfer", schema);