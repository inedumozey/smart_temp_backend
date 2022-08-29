const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User'
        },
        point: {
            type: Number,
            default: 0
        },
        amountRewards: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'SEC'
        },  
        paid: {
            type: Boolean,
            default: false
        },
        resolved: {
            type: Boolean,
            default: false
        }, 
        position: {
            type: Number,
            default: null
        },  
    },
    {
        timestamps: true
    }
)
mongoose.model("Contest", schema);