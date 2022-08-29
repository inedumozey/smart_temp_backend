const express = require("express")
const referralContest = require('../controls/referralContest')
const { adminAuth, priAdminAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/get-all", referralContest.getAll);
route.put("/reset", adminAuth, referralContest.reset);
route.put("/resolve", priAdminAuth, referralContest.resolve);
route.delete("/remove-user/:id", priAdminAuth, referralContest.removeUser);

module.exports = route