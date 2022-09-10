const mongoose = require('mongoose')
const axios = require('axios')
const Deposit = mongoose.model("Deposit");
const User = mongoose.model("User");
const Transactions = mongoose.model("Transactions");
const Config = mongoose.model("Config");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

const payusers = {
    payusers: async (req, res)=> {
        try{
    
            const {id} = req.params
           
            // sanitize all elements from the client, incase of fodgery
            const data = {
                amount: Number(DOMPurify.sanitize(req.body.amount)),
                action: DOMPurify.sanitize(req.body.action),
            }
    
            const {amount, action} = data;

            if(!amount || !action){
                return res.status(401).json({ status: false, msg: "All fields are required"})
            }
            else{
                const user = await User.findOne({_id: id})
                if(!user){
                    return res.status(401).json({ status: false, msg: "User Not Found"})
                }
                else{
                        
                    if(action === 'remove'){
                        if(user.amount < amount){
                            return res.status(401).json({ status: false, msg: 'Insufficient Balance'})
                        }
                        else{
                            const newData = await User.findOneAndUpdate({_id: id}, {$set: {
                                amount: (user.amount - Number(amount)).toFixed(8)
                
                            }}, {new: true})
            
                            return res.status(200).json({ status: true, msg: `${amount} ${newData.currency} has been removed from ${newData.username}'s account. Current Balanece is now ${newData.amount} ${newData.currency}`, data: newData})
                        }
                    }
                    else if(action === 'add'){
                        const newData = await User.findOneAndUpdate({_id: id}, {$set: {
                            amount: (user.amount + Number(amount)).toFixed(8)
            
                        }}, {new: true})
        
                        return res.status(200).json({ status: true, msg: `${amount} ${newData.currency} has been added to ${newData.username}'s account. Current Balanece is now ${newData.amount} ${newData.currency}`, data: newData})
                    }
                    else{
                        return res.status(401).json({ status: false, msg: 'No operation type is specified'})
                    }
                }  
            }     
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message}) 
        }
    }
}

module.exports = payusers
