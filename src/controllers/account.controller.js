const accountModel = require("../models/account.model")
const userModel = require("../models/user.model")

async function createAccount(req , res){
    try {
        const { status , currency } = req.body
        const userId = req.user._id

        // We don't need to check if user exists because authMiddleware already does that
        const account = await accountModel.create({
            user: userId, 
            status, 
            currency
        })

        res.status(201).json({
            account: {
                _id: account._id,
                user: account.user,
                status: account.status,
                currency: account.currency,
            },
            message: "New account generated"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ 
            error: "Error in creating account", 
            details: error.message 
        })
    }
}


async function getBalance(req, res) {
    try {
        const account = await accountModel.findById(req.params.accountId)
        if (!account) {
            return res.status(404).json({ error: "account not found" })
        }
        
        // Ensure the account belongs to the logged-in user
        if (account.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Forbidden: You do not own this account" })
        }

        const balance = await account.getBalance()
        res.status(200).json({ 
            accountId: account._id,
            balance 
        })
    } catch (error) {
        console.log("Get Balance Error:", error.message)
        res.status(500).json({ error: "Error in getting balance", details: error.message })
    }
}

module.exports = { createAccount, getBalance }
