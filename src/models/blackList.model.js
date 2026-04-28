const mongoose = require('mongoose');

const tokenBlackListSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
}, { timestamps: true })

// Automatically delete tokens after 3 days
tokenBlackListSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3 * 24 * 60 * 60 })

const tokenBlackListModel = mongoose.model("TokenBlackList", tokenBlackListSchema)
module.exports = tokenBlackListModel