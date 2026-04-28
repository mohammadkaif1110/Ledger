const express = require("express")
const router = express.Router()
const { authMiddleware } = require("../middleware/auth.middleware")
const { createAccount, getBalance } = require("../controllers/account.controller")

router.post("/", authMiddleware, createAccount)
router.get("/balance/:accountId", authMiddleware, getBalance)

module.exports = router
