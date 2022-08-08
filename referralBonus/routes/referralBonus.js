const express = require("express")
const referralBonus = require('../controls/referralBonus')
const { userAuth, userAuthProfile,  } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/get-all-hx", userAuthProfile, referralBonus.getAllBounuses);

route.get("/get-all-hx-total", userAuthProfile, referralBonus.getAllTotalBounuses);

route.get("/get-hx/:id", userAuthProfile, referralBonus.getBounus);

route.put("/add-referral-code", userAuthProfile, referralBonus.addReferralCode);

route.post("/contest-resolve", referralBonus.contest);

module.exports = route