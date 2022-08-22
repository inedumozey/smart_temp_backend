const mongoose = require('mongoose')
const Contest = mongoose.model("Contest");
require("dotenv").config();

module.exports ={
    getAll: async (req, res)=> {
        try{
            const data = await Contest.find({}).populate({path: 'userId', select: ['_id', 'email', 'username', 'referree']}).sort({point: -1, updatedAt: 1});
            return res.status(200).json({ status: true, msg: "successful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },
}