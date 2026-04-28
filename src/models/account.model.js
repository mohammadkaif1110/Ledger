const mongoose = require("mongoose")
const ledgerModel = require("./ledger.model")
const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    status:{
        type: String,
        enum: ["active", "Frozen", "inactive"],
        default: "active"
    },
    currency:{
        type: String,
        required: [true, "currency is required for creating an account"],
        enum: ["INR", "USD"],
        default: "INR"
    },
},{timestamps: true}
)
accountSchema.index({user: 1, status:1})
accountSchema.methods.getBalance = async function(){
    const accountBalance = await ledgerModel.aggregate([
        {
            $match: {
                account: this._id
            }
        },
        {
            $group: {
                _id: this._id,
                balance: { $sum: "$amount" }
            }
        }
    ])
    return accountBalance.length > 0 ? accountBalance[0].balance : 0
}

const accountModel = mongoose.model("Account", accountSchema)
module.exports = accountModel