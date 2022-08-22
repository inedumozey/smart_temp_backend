const express = require("express")
const referralContest = require('../controls/referralContest')
const { adminAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/get-all", referralContest.getAll);

module.exports = route