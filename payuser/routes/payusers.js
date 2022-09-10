const express = require("express")
const payusers = require('../controls/payusers')
const { priAdminAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.put("/:id", priAdminAuth, payusers.payusers);


module.exports = route