const mongoose = require('mongoose')
const Notification = mongoose.model("Notification");
const User = mongoose.model("User");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');


const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)


module.exports ={
        
    set: async (req, res)=> {
        try{
            const data = {
                title:  DOMPurify.sanitize(req.body.title),
                body: DOMPurify.sanitize(req.body.body)
            }
            if(!data.title || !data.body){
                return res.status(400).json({ status: false, msg: "All fields are required"});
            }else{
                const newNotification = new Notification({
                    title: data.title,
                    body: data.body
                })

                await newNotification.save();

                await User.updateMany({}, {$push: {
                    notifications: newNotification._id
                }})
                return res.status(200).json({ status: true, msg: "Message Sent"});
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    get: async (req, res)=> {
        try{
            const data = await Notification.find({}).sort({createdAt: -1});
            return res.status(200).json({ status: true, msg: "Successful", data});
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },
    
    read: async (req, res)=> {
        try{
            const userId = req.user;
            const {id} = req.params

            // update the the user

            const data = await User.findOneAndUpdate({_id: userId}, {$pull: {
                notifications: id
            }}, {new: true})

            return res.status(200).json({ status: true, msg: "Message updated", data});
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },
    

    
}