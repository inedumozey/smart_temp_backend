const mongoose = require('mongoose')
const ReferralBonus = mongoose.model("ReferralBonus");
const Transactions = mongoose.model("Transactions");
require("dotenv").config();

module.exports ={

    getAll: async (req, res)=> {
        try{
            
            const userId = req.user;

            // get all txn hx
            const txns = await Transactions.find({userId}).sort({createdAt: -1})

            return res.status(200).json({ status: true, msg: "Successful", data: txns, id: userId})

        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },
}
