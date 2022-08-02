const mongoose = require('mongoose')
require('dotenv').config()
const URL = process.env.MONGO_URL ||  `mongodb://localhost:27017/smartEarners`
// const URL = `mongodb://localhost:27017/smartEarners`

module.exports = async() =>{
    try{
        mongoose.connect(URL, {
            useNewUrlParser: true,
            useNewUrlParser: true,
        });
        console.log("Database connected")
    }
    catch(err){
        console.log("Database connection error");
    }
}