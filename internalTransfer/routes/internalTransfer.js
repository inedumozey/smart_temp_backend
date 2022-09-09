const express = require("express")
const internalTransfer = require('../controls/internalTransfer')
const { adminAuth, verifiedUserAuth, userAuthProfile } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/get-all-transactions", adminAuth, internalTransfer.getAllTransactions);
route.get("/get-all-transactions-users", userAuthProfile, internalTransfer.getAllTransactions_user);
route.get("/get-transaction/:id", userAuthProfile, internalTransfer.getTransaction);
route.post("/check-user", verifiedUserAuth, internalTransfer.checkUser);
route.post("/pay-user", verifiedUserAuth, internalTransfer.payUser);


module.exports = route