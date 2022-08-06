const mongoose = require('mongoose')
const Transactions = mongoose.model("Transactions");

module.exports ={

    getAll: async (req, res)=> {
        try{
            
            const userId = req.user;

            // get all txn hx
            const txns = await Transactions.find({$or: [{userId}, {sender: userId}, {receiver: userId}]}).populate({path: 'sender', select: ['_id', 'username', 'accountNumber', 'email']}).populate({path: 'receiver', select: ['_id', 'username', 'accountNumber', 'email']}).sort({createdAt: -1});

            return res.status(200).json({ status: true, msg: "Successful", data: txns, id: userId})

        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },
}
