const mongoose = require('mongoose')
const User = mongoose.model("User");
const Config = mongoose.model("Config");
const Contest = mongoose.model("Contest");
const ReferralBonus = mongoose.model("ReferralBonus");
const ReferralTotalBonus = mongoose.model("ReferralTotalBonus");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

module.exports ={

    getAllBounuses: async (req, res)=> {
        try{ 
            const userId = req.user;

            // get all referralBonus hx
            const txnData = await ReferralBonus.find({referrerId: userId}).populate({path: 'referreeId', select: ['_id', 'email', 'username', 'active', 'hasInvested', 'masterInvestmentCount']}).sort({createdAt: -1});

            return res.status(200).send({status: true, msg: 'Successful', data: txnData})    
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getAllTotalBounuses: async (req, res)=> {
        try{ 
            const userId = req.user;

            // get all referralBonus hx
            const txnData = await ReferralTotalBonus.find({referrerId: userId}).populate({path: 'referreeId', select: ['_id', 'email', 'username', 'active', 'hasInvested', 'masterInvestmentCount']}).sort({createdAt: -1});

            return res.status(200).send({status: true, msg: 'Successful', data: txnData})    
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    contest: async (req, res)=> {
        try{ 
            const userId = req.user;

            // get all referralBonus hx
            const txnData = await ReferralBonus.find({referrerId: userId}).populate({path: 'referreeId', select: ['_id', 'email', 'username', 'active', 'hasInvested', 'masterInvestmentCount']}).sort({createdAt: -1});

            

            return res.status(200).send({status: true, msg: 'Successful', data: txnData})    
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getBounus: async (req, res)=> {
        try{
            const {id} = req.params;
            const userId = req.user;

            // check item if exist
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(404).json({status: false, msg: "Not found"})
            }

            // get the referralBonus
            const txn = await ReferralBonus.findOne({_id: id})

            if(!txn){
                return res.status(404).json({ status: false, msg: "Not found"})

            }
            else{
                // check if the loggeduser is the admin
                const loggeduser = await User.findOne({_id: userId})
                

                // check if the loggeduser was the one that owns the referralBonus hx or the admin
                if(txn.referrerId.toString() === userId.toString() || loggeduser.isAdmin){

                    const txnData = await ReferralBonus.findOne({_id: id}).populate({path: 'referrerId', select: ['_id', 'email', 'username']}).populate({path: 'referreeId', select: ['_id', 'email', 'username', 'hasReturnedReferralBonus', 'hasInvested', 'firstInvestmentPlanValue']});

                    return res.status(200).send({status: true, msg: 'Success', data: txnData})
                }
                else{
                    return res.status(400).send({status: false, msg: 'Access denied!'})
                }
            }       
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    addReferralCode: async (req, res)=> {
        try{
            const userId = req.user

            // sanitize all elements from the client, incase of fodgery
            const data = {
                refcode:  DOMPurify.sanitize(req.body.refcode),
            }

            // get currency and verifyEmail from config data if exist otherwise set to the one in env
            // get all config
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;
            
            const startContestReg = config && config.length >= 1 && config[0].startContestReg? config[0].startContestReg : process.env.START_CONTEST_REG;

            // get the logged user
            const loggedUser = await User.findOne({_id: userId});

            // get the referrer user using the refcode
            const referrerUser = await User.findOne({referralCode: data.refcode});
            // check to be sure user has not already been refferred by
            if(loggedUser.referrerId){
                // get the user that referred him prior
                const priorReferrerUser = await User.findOne({_id: loggedUser.referrerId});

                return res.status(400).json({status: false, msg: `You have already been referred by ${priorReferrerUser.username}`})
            }

            else if(!referrerUser){
                return res.status(404).json({status: false, msg: "User not found"})
            }

            else if(loggedUser.referralCode === data.refcode.trim()){
                return res.status(400).json({status: false, msg: `Owner's Referral Code`})
            }
            else{
                // push the loggedUser to the referrerUser's referree list
                await User.findOneAndUpdate({referralCode: data.refcode}, {$push: {
                    referree: userId
                }})

                // add the referrerUser to the referrerId of the loggedUser
                const updatedData = await User.findOneAndUpdate({_id: userId}, {$set: {
                    referrerId: referrerUser.id
                }}, {new: true}).populate({path: 'referrerId', select: ['_id', 'email', 'username']}).populate({path: 'referree', select: ['_id', 'email', 'username', 'hasInvested']});

                // create referralBonus collection
                const newReferralTotalBonus = new ReferralTotalBonus({
                    referreeId: userId,
                    referrerId: referrerUser.id,
                    amount: 0,
                    currency
                })
                await newReferralTotalBonus.save()

                // instantiate Contest Database with the referrer user
                // Only save user to contest if not in before
                const contest = await Contest.findOne({userId: referrerUser.id})
                if(!contest && startContestReg==='yes'){
                    const newContest = new Contest({
                        userId: referrerUser.id,
                    })
                    await newContest.save()
                }

                return res.status(200).json({status: true, msg: `You have been successfully added to the referree list of ${referrerUser.username}`, data: updatedData})
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },
}
