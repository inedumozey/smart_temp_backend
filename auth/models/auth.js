const mongoose = require('mongoose');
const { Schema } = mongoose
const objectID = Schema.Types.ObjectId

const schema = new mongoose.Schema(
    {
        username: {
            type: String,
            require: true,
            unique: true
        },
        email: {
            type: String,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            require: true,
            unique: true,
            trim: true
        },
        avater:{
            type: String,
            default: null
        },
        phone:{
            type: String,
            default: null
        },
        amount: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'SEC'
        },
        accountNumber: {
            type: String,
            unique: true,
            require: true,
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        isPrimaryAdmin: {
            type: Boolean,
            default: false
        },
        token: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        hasInvested: {
            type: Boolean,
            default: false
        },
        referralCode: {
            type: String,
            require: true,
            unique: true,
        },
        referree: [ {
            type: objectID,
            ref: 'User'
        } ],
        referrerId: {
            type: objectID,
            ref: 'User',
            default: null
        },
        active:{
            type: Number,
            default: 0
        },
        masterInvestmentCount: {
            type: Number,
            default: 0
        },
        notifications: [
            {
                type: objectID,
                ref: 'Notification', 
            }
        ]
    },
    {
        timestamps: true
    }
)
mongoose.model("User", schema);