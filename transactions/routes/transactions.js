const express = require("express")
const transactions = require('../controls/transactions')
const { userAuthProfile } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/getAll", userAuthProfile, transactions.getAll);


module.exports = route
