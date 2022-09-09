const mongoose = require('mongoose')
const axios = require('axios')
const Deposit = mongoose.model("Deposit");
const User = mongoose.model("User");
const Transactions = mongoose.model("Transactions");
const Config = mongoose.model("Config");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const conversionRate = require('../../config/conversionRate');
const { Client, resources, Webhook } = require('coinbase-commerce-node');

const PRODUCTION = Boolean(process.env.PRODUCTION);

const API_KEY_DEV = "326db613-b084-4c42-86b1-05ff3828353b";
const WEBHOOK_SECRET_DEV = "6367d535-8dce-4eea-993f-20bfd23cbfbd"

const API_KEY = "8223ccf5-0d2e-48de-b598-6aac58bb1180";
const WEBHOOK_SECRET = "3b3dbfd1-7c99-4c15-96bc-894c2000f3a3"

Client.init(process.env.ENV !=='dev' ? API_KEY : API_KEY_DEV);
const {Charge} = resources;

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

const DOMAIN = process.env.FRONTEND_BASE_URL
const DOMAIN_DEV = process.env.FRONTEND_BASE_URL_DEV

module.exports ={
    
    deposit: async (req, res)=> {
        try{
            
            const userId = req.user
            const user = await User.findOne({_id: userId})

            // sanitize all elements from the client, incase of fodgery
            // amount is in dollars
            const data = {
                amount: Number(DOMPurify.sanitize(req.body.amount)),
            }

            // get all config
            const config = await Config.find({});

            const name = config && config.length >= 1 && config[0].name ? config[0].name : process.env.COMPANY_NAME

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;

            const bio = config && config.length >= 1 && config[0].bio ? config[0].bio : process.env.BIO

            if(!data.amount){
                return res.status(400).json({ status: false, msg: "All fields are required"})
            }

            const chargeData = {
                name: name,
                description: bio,
                local_price: {
                    amount: data.amount,
                    currency: 'USD'
                },
                pricing_type: "fixed_price",
                metadata: {
                    customer_id: userId,
                    customer_name: user.username
                },

                redirect_url: process.env.ENV !=='dev' ? `${DOMAIN}dashboard` : `${DOMAIN_DEV}dashboard`,
                cancel_url: process.env.ENV !=='dev' ? `${DOMAIN}dashboard` : `${DOMAIN_DEV}dashboard`
            }

            const charge = await Charge.create(chargeData)
            const  nativeAmountExpected = await conversionRate.USD_TO_SEC(Number(charge.pricing.local.amount));
            const tradeAmountExpected = Number(charge.pricing.local.amount);
           
            // save info to the databse
            const newDepositData = new Deposit({
                userId: charge.metadata.customer_id,
                code: charge.code,
                tradeAmountExpected,
                tradeAmountReceived: 0,
                tradeCurrency: charge.pricing.local.currency,
                nativeAmountExpected,
                nativeAmountReceived: 0,
                overPaidBy: 0,
                underPaidBy: 0,
                currency, // native currency of the app
                overPaymentThreshold: charge.payment_threshold.overpayment_relative_threshold,
                underPaymentThreshold: charge.payment_threshold.underpayment_relative_threshold,
                status: "charge-created",
                amountResolved: null,
                link: charge.hosted_url
            })

            await newDepositData.save()

            // ave to Transactions 
            const NewTransactionHx = new Transactions({
                type: 'deposit',
                userId: charge.metadata.customer_id,
                code: charge.code,
                tradeAmountExpected,
                tradeAmountReceived: 0,
                tradeCurrency: charge.pricing.local.currency,
                nativeAmountExpected,
                nativeAmountReceived: 0,
                overPaidBy: 0,
                underPaidBy: 0,
                currency, // native currency of the app
                overPaymentThreshold: charge.payment_threshold.overpayment_relative_threshold,
                underPaymentThreshold: charge.payment_threshold.underpayment_relative_threshold,
                status: "charge-created",
                comment: 'created',
                amountResolved: null,
                link: charge.hosted_url,
                transactionId: newDepositData._id
            })
            await NewTransactionHx.save()

            const data_ = {
                hostedUrl: newDepositData.link,
                redirecturl: chargeData.redirect_url,
                cancelUrl: chargeData.cancel_url,
            }

            // send the redirect to the client
            return res.status(200).json({ status: true, msg: 'charge created', data: data_})
           

        }
        catch(err){
            if(err.response){
                return res.status(500).json({ status: false, msg: err.response.data})
                 
            }else{
                if(err.message.includes('ENOTFOUND') || err.message.includes('ETIMEDOUT') || err.message.includes('ESOCKETTIMEDOUT')){
                    return res.status(500).json({ status: false, msg: 'Poor network connection'})
                }
                else{
                    return res.status(500).json({ status: false, msg: err.message})
                }
            }
        }
    },

    depositWebhook: async (req, res)=> {
        try{
            
            const rawBody = req.rawBody;
            const signature = req.headers['x-cc-webhook-signature'];
            const webhookSecret = process.env.ENV !=='dev' ? WEBHOOK_SECRET : WEBHOOK_SECRET_DEV;
            const event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);

            // get the deposit database
            const depositHx = await Deposit.findOne({code: event.data.code})

            // charge canceled
            if(event.type === 'charge:failed' && !event.data.payments[0] && depositHx.status === 'charge-created'){
                await Deposit.findOneAndUpdate({code: event.data.code}, {$set: {
                    comment: 'canceled',
                    status: 'charge-failed',
                }})

                // find and update transaction hx the transactionId
                // 1. find the particular deposit using the code
                const depositH = await Deposit.findOne({code: event.data.code})
                await Transactions.findOneAndUpdate({transactionId: depositH._id}, {$set: {
                    comment: 'canceled',
                    status: 'canceled'
                }});
            }

            // charge pending
            else if(event.type === 'charge:pending' && depositHx.status === 'charge-created'){
                await Deposit.findOneAndUpdate({code: event.data.code}, {$set: {
                    comment: 'pending',
                    status: 'charge-pending',
                }});

                // find and update transaction hx the transactionId
                // 1. find the particular deposit using the code
                const depositH = await Deposit.findOne({code: event.data.code})
                await Transactions.findOneAndUpdate({transactionId: depositH._id}, {$set: {
                    comment: 'pending',
                    status: 'pending'
                }});
            }

            // charge conmfirmed
            else if(event.type === 'charge:confirmed' && (depositHx.status === 'charge-pending' ||  depositHx.status === 'charge-created')){
                const amountReceived_ = event.data.payments[0].value.crypto.amount;
                const cryptocurrency = event.data.payments[0].value.crypto.currency;

                // convert amount received from whatever the currency paid with to USD
                const res = await axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=${cryptocurrency}`);
                const amountReceived = Number(res.data.data.rates.USD) * Number(amountReceived_);

                const amountReceive = amountReceived.toFixed(8);
                const nativeAmountReceived = await conversionRate.USD_TO_SEC(amountReceive);

                await Deposit.findOneAndUpdate({code: event.data.code}, {$set: {
                    tradeAmountReceived: amountReceive,
                    nativeAmountReceived,
                    comment: 'successful',
                    status: 'charge-confirmed',
                }});

                // find and update transaction hx the transactionId
                // 1. find the particular deposit using the code
                const txn = await Deposit.findOne({code: event.data.code, resolved: false})
                await Transactions.findOneAndUpdate({transactionId: txn._id, resolved: false}, {$set: {
                    comment: 'successful',
                    status: 'successful',
                    tradeAmountReceived: amountReceive,
                    nativeAmountReceived
                }});

                // update the user's account with the amount recieved (nativeAmountReceived); only get the users whose status is still pending
                const user = await User.findOne({_id: txn.userId});
                await User.findByIdAndUpdate({_id: txn.userId}, {$set: {
                    amount: user.amount + nativeAmountReceived
                }})

                await Transactions.findOneAndUpdate({transactionId: txn._i}, {$set: {
                    resolved: true
                }});

            }

            // charge incorrect payment (overpayment/underpayment)
            else if((event.type === 'charge:failed' && event.data.payments[0]) && (depositHx.status === 'charge-pending' || depositHx.status === 'charge-created')){
                const amountExpected = Number(depositHx.tradeAmountExpected)
                const amountReceived_ = Number(event.data.payments[0].value.crypto.amount);
                const cryptocurrency = event.data.payments[0].value.crypto.currency;
                const overpayment_threshold = Number(event.data.payment_threshold.overpayment_relative_threshold);
                const underpayment_threshold = Number(event.data.payment_threshold.underpayment_relative_threshold);

                // convert amount received from whatever the currency paid with to USD
                const res = await axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=${cryptocurrency}`);
                const amountReceived = Number(res.data.data.rates.USD) * Number(amountReceived_);

                // const isUnderpaid = (amountReceived < amountExpected) && (amountExpected - amountReceived < underpayment_threshold);

                const isOverpaid = (amountReceived > amountExpected) && ( amountReceived - amountExpected > (overpayment_threshold - 0.004));

                
                const resolveComent =()=>{
                    
                    if(isOverpaid){
                        return "overpayment"
                    }

                    else{
                        return "underpayment"
                    }
                }

                const resolveOverPayment =()=>{
                    if(isOverpaid){
                        const amountDiff = amountReceived - amountExpected
                        return amountDiff.toFixed(8)
                    }

                    else{
                        return 0
                    }
                }

                const resolveUnderPayment =()=>{
                    if(!isOverpaid){
                        const amountDiff = amountExpected - amountReceived
                        return amountDiff.toFixed(8)
                    }

                    else{
                        return 0
                    }
                }

                const amountReceive = amountReceived.toFixed(8);
                const nativeAmountReceived = await conversionRate.USD_TO_SEC(amountReceive);
                
                await Deposit.findOneAndUpdate({code: event.data.code, resolved: false}, {$set: {
                    tradeAmountReceived: amountReceive,
                    nativeAmountReceived,
                    comment: resolveComent(),
                    status: 'charge-confirmed',
                    overPaidBy: resolveOverPayment(),
                    underPaidBy: resolveUnderPayment()
                }}) 
                    
                // find and update transaction hx the transactionId
                // 1. find the particular deposit using the code
                const txn = await Deposit.findOne({code: event.data.code, resolved: false});
                
                await Transactions.findOneAndUpdate({transactionId: txn._id}, {$set: {
                    tradeAmountReceived: amountReceive,
                    nativeAmountReceived,
                    status: 'successful',
                    comment: resolveComent(),
                    overPaidBy: resolveOverPayment(),
                    underPaidBy: resolveUnderPayment()
                }});

                // update the user's account with the amount recieved (nativeAmountReceived); only get the users whose status is still pending
                const user = await User.findOne({_id: txn.userId});
                await User.findByIdAndUpdate({_id: txn.userId}, {$set: {
                    amount: user.amount + nativeAmountReceived
                }})

                await Deposit.findOneAndUpdate({code: event.data.code}, {$set: { resolved: true }}) 
            }
                        
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getAllDeposits: async (req, res)=> {
        try{
            
            const txn = await Deposit.find({}).populate({path: 'userId', select: ['_id', 'email', 'username']}).sort({updatedAt: -1});
            // send the redirect to the client
            return res.status(200).json({ status: true, msg: 'successful', data: txn})

        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.response.data})
        }
    },

    getAllDeposits_users: async (req, res)=> {
        try{
            const userId = req.user

            const txns = await Deposit.find({userId}).populate({path: 'userId', select: ['_id', 'email', 'username']}).sort({updatedAt: -1});
            return res.status(200).json({ status: true, msg: 'successful', data: txns})

        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.response.data})
        }
    },

    resolve: async (req, res)=> {
        try{
            const {id} = req.params;

            const data = {
                amount: Number(DOMPurify.sanitize(req.body.amount)),
            }

            if(!data.amount){
                return res.status(400).json({ status: false, msg: 'The field is required'})
            }
            else{
                const convertedAmount = await conversionRate.USD_TO_SEC(data.amount)

                // find the deposit hx
                const txn = await Deposit.findOne({_id: id})

                if(txn.status === 'charge-confirmed'){
                    return res.status(400).json({ status: false, msg: 'This transaction is alread successful'})
                }
                else{
                    //find and update transaction in deposit and transaction hx
                    const newData = await Deposit.findOneAndUpdate({_id: id}, {$set: {
                        comment: 'Manual',
                        status: 'charge-confirmed',
                        nativeAmountReceived: convertedAmount.toFixed(8),
                        tradeAmountReceived: data.amount.toFixed(8)
                    }}, {new: true})

                    await Transactions.findOneAndUpdate({transactionId: id}, {$set: {
                        comment: 'Manual',
                        status: 'successful',
                        nativeAmountReceived: convertedAmount.toFixed(8),
                        tradeAmountReceived: data.amount.toFixed(8)
                    }});

                    // find the user and update his/her acount balance
                    const user = await User.findOne({_id: newData.userId})
                    await User.findOneAndUpdate({_id: newData.userId}, {$set: {
                        amount: (user.amount + convertedAmount).toFixed(8)
                    }})

                    return res.status(200).json({ status: true, msg: 'successfu', data: newData})
                }
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

}
