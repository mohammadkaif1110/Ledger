const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({
    from:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: false,
        index: true
    },
    to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        index: true
    },
    amount:{
        type: Number,
        required: true
    },
    idempotencyKey:{
        type: String,
        required: true,
        unique: true,
        index: true
    },
    status:{
        type: String,
        enum: ["success", "failed", "pending"],
        default: "pending"
    }
}, {timestamps: true})

const transactionModel = mongoose.model("Transaction", transactionSchema)
module.exports = transactionModel