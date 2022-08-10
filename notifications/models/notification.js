const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        body: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)
const Notification = mongoose.model("Notification", schema);

module.exports = Notification;


