import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "Username already exists"],
        require: true
    },

    email: {
        type: String,
        unique: [true, "Account already exists with this email"],
        require: true
    },

    password: {
        type: String,
        require: true
    },

})

const userModel = mongoose.model("users", userSchema)

export default userModel