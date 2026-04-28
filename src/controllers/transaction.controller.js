const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const userModel = require("../models/user.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")

async function transferMoney(req, res) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const { from, to, amount, idempotencyKey } = req.body

        if (!from || !to || !idempotencyKey || !amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid input fields" })
        }

        const sender = await accountModel.findById(from)
        const receiver = await accountModel.findById(to)

        if (!sender || !receiver || sender.status !== "active" || receiver.status !== "active") {
            return res.status(400).json({ error: "Invalid or inactive accounts" })
        }

        // Validate idempotency
        const idempotencyCheck = await transactionModel.findOne({ idempotencyKey })
        if (idempotencyCheck) {
            if (idempotencyCheck.status === "success") {
                return res.status(200).json({
                    message: "Transaction already completed successfully",
                    transaction: idempotencyCheck
                });
            }
            if (idempotencyCheck.status === "pending") {
                return res.status(400).json({ message: "Transaction is in progress" });
            }
            if (idempotencyCheck.status === "failed") {
                return res.status(400).json({ message: "Previous transaction attempt failed", transaction: idempotencyCheck });
            }
        }

        // Check balance
        const balance = await sender.getBalance()
        if (balance < amount) {
            return res.status(400).json({ error: "Insufficient balance" })
        }

        // Create transaction record
        const transaction = await transactionModel.create([{
            from, to, amount, idempotencyKey, status: "pending"
        }], { session })

        // Create ledger entries
        await ledgerModel.create([
            { account: from, amount: -amount, transaction: transaction[0]._id, type: "debit" },
            { account: to, amount: amount, transaction: transaction[0]._id, type: "credit" }
        ], { session, ordered: true })

        // Update transaction status
        transaction[0].status = "success"
        await transaction[0].save({ session })

        await session.commitTransaction()
        session.endSession()

        // Async emails (don't block response)
        const senderUser = await userModel.findById(sender.user).select("email user_name")
        const receiverUser = await userModel.findById(receiver.user).select("email user_name")

        if (senderUser) {
            emailService.sendMoneyTransferEmail(senderUser.email, senderUser.user_name, amount, to)
        }
        if (receiverUser) {
            emailService.sendEmail(
                receiverUser.email,
                "Funds Received",
                `Hello ${receiverUser.user_name}, you have received ${amount} in your account.`
            )
        }

        res.status(200).json({
            message: "Transaction successful",
            transaction: transaction[0]
        })

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.log(error)
        res.status(500).json({ error: "Error in transferring money", details: error.message })
    }
}

async function initialFunds(req, res) {
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const { to, amount, idempotencyKey } = req.body
        const targetAccount = to

        if (!targetAccount || !idempotencyKey || !amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid input fields (accountId/to, amount, and idempotencyKey are required)" })
        }

        const account = await accountModel.findById(targetAccount)
        if (!account || account.status !== "active") {
            return res.status(400).json({ error: "Invalid or inactive account" })
        }

        // Validate idempotency
        const idempotencyCheck = await transactionModel.findOne({ idempotencyKey })
        if (idempotencyCheck) {
            return res.status(400).json({ message: "Idempotency key already used", status: idempotencyCheck.status })
        }

        // Create transaction (no 'from' for system funds)
        const transaction = await transactionModel.create([{
            from: null,
            to: targetAccount,
            amount,
            idempotencyKey,
            status: "pending"
        }], { session })

        // Create ledger entry for receiver only
        await ledgerModel.create([
            { account: targetAccount, amount: amount, transaction: transaction[0]._id, type: "credit" }
        ], { session, ordered: true })

        transaction[0].status = "success"
        await transaction[0].save({ session })

        await session.commitTransaction()
        session.endSession()

        res.status(200).json({
            message: "Initial funds added successfully",
            transaction: transaction[0]
        })

    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.log(error)
        res.status(500).json({ error: "Error in adding initial funds", details: error.message })
    }
}

module.exports = { transferMoney, initialFunds }