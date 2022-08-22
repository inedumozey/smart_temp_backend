const express = require("express")
const message = require('../controls/message')

const route = express.Router()

route.post("/send-admin", message.sendAdmin);


module.exports = route