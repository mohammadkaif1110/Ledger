const express = require("express")
const router = express.Router()
const {transferMoney, initialFunds } = require("../controllers/transaction.controller")
const authMiddleware = require("../middleware/auth.middleware")

router.post("/", authMiddleware.authMiddleware, transferMoney) 
router.post("/system/initial-funds",   authMiddleware.authSystemMiddleware, initialFunds )

module.exports = router

