const express = require("express")
const notification = require('../controls/notification')
const { adminAuth, verifiedUserAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.post("/set", adminAuth, notification.set);

route.get("/get-all", verifiedUserAuth, notification.get);

route.put("/handle-read/:id", verifiedUserAuth, notification.read);


module.exports = route