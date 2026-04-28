const express = require("express")
const router = express.Router()
const { registerUser, Userlogin, logout } = require("../controllers/auth.controller")

router.post("/register", registerUser)
router.post("/login", Userlogin)
router.post("/logout", logout)

module.exports = router