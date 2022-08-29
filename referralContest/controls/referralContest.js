const mongoose = require('mongoose')
const User = mongoose.model("User");
const Config = mongoose.model("Config");
const Contest = mongoose.model("Contest");
require("dotenv").config();

module.exports ={
    getAll: async (req, res)=> {
        try{
            const data = await Contest.find({}).populate({path: 'userId', select: ['_id', 'email', 'username', 'referree', 'amount',]}).sort({point: -1, updatedAt: 1});
            return res.status(200).json({ status: true, msg: "successful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    reset: async (req, res)=> {
        try{
            const config = await Config.find({});

            const allowReferralContest = config && config.length >= 1 && config[0].allowReferralContest? config[0].allowReferralContest : process.env.ALLOW_REFERRAL_CONTEST;

            const referralContestStarts = config && config.length >= 1 && config[0].referralContestStarts

            const referralContestStops = config && config.length >= 1 && config[0].referralContestStops

            const currentTime = Date.now()
            const startsAt = new Date(referralContestStarts).getTime()
            const stopsAt = new Date(referralContestStops).getTime()

            const contestIsOn = currentTime >= startsAt && currentTime <= stopsAt;

            //check if contest is still on, send error
            if(allowReferralContest ==='yes'){
                return res.status(400).json({ status: false, msg: "Contest is still active, deactivate it before reseting"})
            }

            else if(contestIsOn){
                return res.status(400).json({ status: false, msg: "Data cannot be reseted when contest is till on going, try again later"})
            }
            else{
                await Contest.updateMany({}, {$set:{
                    point: 0,
                    amountRewards: 0,
                    paid: false,
                    position: null,
                    resolved: false
                }}, {new: true});
    
                const data = await Contest.find({}).populate({path: 'userId', select: ['_id', 'email', 'username', 'referree']}).sort({point: -1, updatedAt: 1});
                return res.status(200).json({ status: true, msg: "Reseted Successfully", data})
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    resolve: async (req, res)=> {
        try{
            const config = await Config.find({});

            const allowReferralContest = config && config.length >= 1 && config[0].allowReferralContest? config[0].allowReferralContest : process.env.ALLOW_REFERRAL_CONTEST;

            const referralContestStarts = config && config.length >= 1 && config[0].referralContestStarts

            const referralContestStops = config && config.length >= 1 && config[0].referralContestStops
            
            const referralContestPrize = config && config.length >= 1 && config[0].referralContestPrize

            const currentTime = Date.now()
            const startsAt = new Date(referralContestStarts).getTime()
            const stopsAt = new Date(referralContestStops).getTime()

            const contestIsOn = currentTime >= startsAt && currentTime <= stopsAt;
            const data = await Contest.find({}).sort({point: -1, updatedAt: 1});

            // get the users of the length of referralContestPrize - 1
            const qualifiedUsers = data.slice(0, referralContestPrize.length);

            //check if contest is still on, send error
            if(allowReferralContest !=='yes'){
                return res.status(400).json({ status: false, msg: "Contest is not active"})
            }

            else if(contestIsOn){
                return res.status(400).json({ status: false, msg: "Contest is till on going, try again later"})
            }
            
            else{
                // otherwise pay users

                //loop through referralContestPrize and get each price together with the users of the length of the referralContestPrize
                for(let i=0; i<referralContestPrize.length; i++){
                    if(qualifiedUsers[i] && !qualifiedUsers[i].paid && qualifiedUsers[i].point > 0){
                        await Contest.findOneAndUpdate({userId: qualifiedUsers[i].userId}, {$set: {
                            amountRewards: referralContestPrize[i],
                            paid: true,
                            position: Number(i) + 1
                        }}) 
                    }
                } 

                // find those that were paid (those that were qualified) in the User database and update their account balance
                const contestants = await Contest.find({paid: true});
                
                for(let contestant of contestants){
                    if(!contestant.resolved){
                        await User.findOneAndUpdate({_id: contestant.userId}, {$inc: {
                            amount: contestant.amountRewards
                        }});

                        await Contest.findOneAndUpdate({_id: contestant.id}, {$set: {
                            resolved: true
                        }})
                    }
                }  

                // send the updated contest data to the frontend
                const data = await Contest.find({}).populate({path: 'userId', select: ['_id', 'email', 'username', 'referree', 'amount']}).sort({point: -1, updatedAt: 1});
                return res.status(200).json({ status: true, msg: "Rewarded Successfully", data})
            }

        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },


    removeUser: async (req, res)=> {
        try{
            const {id} = req.params;

            // remove the collection with this id

            await Contest.findOneAndDelete({_id: id});

            const data = await Contest.find({}).populate({path: 'userId', select: ['_id', 'email', 'username', 'referree', 'amount']}).sort({point: -1, updatedAt: 1});
            return res.status(200).json({ status: true, msg: "successful", data})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },    
}
