const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        referrerId: {
            type: ObjectId,
            ref: 'User'
        },
        referreeId: {
            type: ObjectId,
            ref: 'User'
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
mongoose.model("ReferralTotalBonus", schema);