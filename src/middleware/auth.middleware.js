const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenBlackListModel = require("../models/blackList.model")

async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            return res.status(401).json({ error: "user is not logged in" })
        }

        // Check if token is blacklisted
        const isBlacklisted = await tokenBlackListModel.findOne({ token })
        if (isBlacklisted) {
            return res.status(401).json({ error: "Token is no longer valid (logged out)" })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decodedToken._id)
        if (!user) {
            return res.status(401).json({ error: "user not found" })
        }
        req.user = user
        next()
    } catch (error) {
        console.log("Auth Middleware Error:", error.message)
        res.status(401).json({ error: "token is invalid", details: error.message })
    }
}

async function authSystemMiddleware(req, res, next) {
    try {
        const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res.status(401).json({ error: "user is not logged in" })
        }

        // Check if token is blacklisted
        const isBlacklisted = await tokenBlackListModel.findOne({ token })
        if (isBlacklisted) {
            return res.status(401).json({ error: "Token is no longer valid (logged out)" })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decodedToken._id)

        if (!user) {
            return res.status(401).json({ error: "user not found" })
        }

        if (!user.systemUser) {
            return res.status(403).json({ error: "forbidden: not a system user" })
        }

        req.user = user
        next()
    } catch (error) {
        console.log("System Auth Error:", error.message)
        res.status(401).json({ error: "token is invalid", details: error.message })
    }
}

module.exports = { authMiddleware, authSystemMiddleware }
