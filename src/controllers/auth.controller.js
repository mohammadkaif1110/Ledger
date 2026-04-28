const express = require("express")
const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const sendEmail = require("../utils/sendEmail")
const { sendRegistrationEmail } = require("../services/email.service");
const tokenBlackListModel = require("../models/blackList.model")

const registerUser = async(req, res) => {
    try {
        const {user_name , email, password} = req.body
        const userExists = await userModel.findOne({email})
        if(userExists){
            return res.send("User already exists")
        }
        const user = await userModel.create({user_name , email, password})
        
        await sendEmail({
            email: user.email,
            subject: "Welcome to Ledger!",
            message: `Hello ${user.user_name},\n\nThank you for registering on Ledger! We're excited to have you on board.\n\nBest Regards,\nThe Ledger Team`
        })

        const token = jwt.sign({_id: user._id} , process.env.JWT_SECRET , {expiresIn: "7d"})
        res.cookie("token" , token)

        res.status(201).json({
            user: {
                user_name: user.user_name,
                email: user.email,
                password: user.password,
            },
            token 
        })

        sendRegistrationEmail(user.email, user.user_name);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Error in user registration", details: error.message, stack: error.stack })
    }
}

const Userlogin = async(req , res) => {
    try {
        const {email , password} = req.body
        const user = await userModel.findOne({email})
        if(!user){
            return res.send("User not found")
        }
        const validPassword = await user.comparePassword(password)
        if(!validPassword){
            return res.send("Invalid password")
        }
        const token = jwt.sign({_id: user._id} , process.env.JWT_SECRET , {expiresIn: "7d"})
        res.cookie("token" , token)
        res.status(200).json({
            user: {
                _id: user._id,
                user_name: user.user_name,
                email: user.email
            },
            token,
            message: "user logged in successfully"
            
        })
    } catch (error) {
        console.log(error)
        res.send("Error in user login")
    }
}

const logout = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
        
        if (!token) {
            return res.status(401).json({ error: "No token provided" })
        }

        // Add to blacklist
        await tokenBlackListModel.create({ token })

        res.clearCookie("token")
        res.status(200).json({ message: "User logged out successfully" })
    } catch (error) {
        console.log("Logout Error:", error.message)
        res.status(500).json({ error: "Error in user logout" })
    }
}

module.exports = { registerUser, Userlogin, logout }
