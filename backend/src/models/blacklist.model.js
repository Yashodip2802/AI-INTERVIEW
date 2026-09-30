import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        require: true
    }
}, {timestamps: true})

const blacklistModel = mongoose.model("blacklist", blacklistSchema)

export default blacklistModel