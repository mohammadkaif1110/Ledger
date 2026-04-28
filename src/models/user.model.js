const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        lowercase:true,
        unique: [true, "Email already exist"],
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "invalid email adress"],

    },
    password:{
        type: String,
        required: true, 
        minlength:[6 , "password should be atleast 6 characters"],
        maxlength:[12, "password should not be more then 12 characters"]
    },
    systemUser:{
        type: Boolean,
        default: false
    }
    },{
    timestamps:true
    
})

userSchema.pre("save" , async function(){
    if(!this.isModified("password")) return
    
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function(password){
    return bcrypt.compare(password, this.password)
}

const userModel = mongoose.model("user" , userSchema)

module.exports = userModel
