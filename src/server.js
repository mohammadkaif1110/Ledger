require("dotenv").config()
const dbConnect = require("./config/db")
const app = require("./app")


dbConnect()
app.listen(8000, ()=>{
    console.log("Server is running on port 8000")
})
// Restart trigger