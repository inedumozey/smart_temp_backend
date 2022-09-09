const express = require("express")
const deposit = require('../controls/deposit')
const { adminAuth, verifiedUserAuth, priAdminAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.post("/deposit", verifiedUserAuth, deposit.deposit);
route.post("/payment-handler", deposit.depositWebhook);
route.get("/deposit/get-all", adminAuth, deposit.getAllDeposits);
route.get("/deposit/get-all-users", verifiedUserAuth, deposit.getAllDeposits_users);
// route.get("/deposit/get/:id", adminAuth, deposit.getDeposit);
route.put("/deposit/resolve/:id", priAdminAuth, deposit.resolve);


module.exports = route