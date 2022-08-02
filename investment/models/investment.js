const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {   
        type: {
            type: String,
            required: true,
            trim: true,
        },
        returnPercentage: {
            type: Number,
            required: true,
            trim: true
        },
        lifespan: {
            type: Number,
            required: true,
            trim: true // in seconds
        },
        userId: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        rewarded: {
            type: Boolean,
            default: false
        },
        rewards: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'SEC',
            required: true,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("Investment", schema);