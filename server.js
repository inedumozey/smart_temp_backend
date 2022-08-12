"use strict"

const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const fileupload = require("express-fileupload")
const http = require("http")
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const winston = require("./config/winstonConfig")
const db = require('./config/db');
const errorResponder = require('./error/catchAll')
const app = express();
const server = http.createServer(app);
const {Server} = require('socket.io')
// const Notification = require("./notifications/models/notification")

const URL = process.env.MONGO_URL_DEV
// const URL = process.env.MONGO_URL
// const URL = process.env.MONGO_URL_DOGITAL_OCEAN;

mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', ()=>{
    console.log("Database connected");
})



// parse requests of json type
app.use(express.json({
    verify: (req, res, buf)=>{
        req.rawBody = buf
    }
}))

// parse requests of content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false}));

// Parse cookie in app
app.use(cookieParser())

// logger
// app.use(morgan('combined', { stream: winston.stream }));

// cross-origin request
var corsOptions = {
    origin: process.env.ENV==='dev' ? process.env.FRONTEND_BASE_URL_DEV : process.env.FRONTEND_BASE_URL,
    credentials: true
};
app.use(cors(corsOptions))

// const io = new Server(server, {
//     cors: {
//         origin: process.env.ENV==='dev' ? 'http://localhost:3000' : 'https://www.teamsmartearners.com'
//     }
// })


// io.on('connection', socket=>{
//     console.log("someon in")
// })

// Notification.watch().
// on('change', data=>{
  
//     if(data.operationType === 'insert'){
//         //get the data
//         const info = {
//             id: data.fullDocument._id,
//             title: data.fullDocument.title,
//             body: data.fullDocument.body,
//             isRead: data.fullDocument.isRead,
//             createdAt: data.fullDocument.createdAt,
//             updatedAt: data.fullDocument.updatedAt,
//         }
//         io.emit("notifications", data.fullDocument._id)
//     }
// })



app.use(fileupload())

// register database model
require('./auth/models/auth')
require('./auth/models/passwordReset')
require('./auth/models/profileImg')

require('./websiteConfig/models/websiteConfig')
require('./internalTransfer/models/internalTransfer')
require('./investment/models/investmentPlan')
require('./investment/models/investment')
require('./referralBonus/models/referralBonus')
require('./referralBonus/models/referralTotalBonus')
require('./deposit/models/deposit')
require('./withdrawal/models/withdrawal')
require('./notifications/models/notification')
require('./testimonials/models/testimonials')
require('./transactions/models/transactions')

// routes
app.use('/auth',  require("./auth/routes/auth")); 
app.use('/config',  require('./websiteConfig/routes/config')); 
app.use('/transfer',  require('./internalTransfer/routes/internalTransfer')); 
app.use('/investment',  require('./investment/routes/investment')); 
app.use('/referral-bonus',  require('./referralBonus/routes/referralBonus')); 
app.use(require('./deposit/routes/deposit')); 
app.use('/withdrawal',  require('./withdrawal/routes/withdrawal')); 
app.use('/notification',  require('./notifications/routes/notification')); 
app.use('/testimonials',  require('./testimonials/routes/testimonials')); 
app.use('/transactions',  require('./transactions/routes/transactions')); 

// Catch all Error Handler
app.use(errorResponder);

// normalize port
const normalizePort = (val) => {
    let port = parseInt(val, 10)

    if(isNaN(port)) return val
    
    if(port >= 0) return port
    
    return false
}

// connect server
const PORT = normalizePort(process.env.PORT || "4000")
server.listen(PORT, (err)=>{
    if(err){
        console.log(err.message)
    }
    else{
        console.log(`Server connected in port ${PORT}`)
    }
})







