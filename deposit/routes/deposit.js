const express = require("express")
const deposit = require('../controls/deposit')
const { adminAuth, verifiedUserAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.post("/deposit", verifiedUserAuth, deposit.deposit);
route.post("/payment-handler", deposit.depositWebhook);
route.post("/manual-resolve", deposit.manualResolve);


module.exports = route