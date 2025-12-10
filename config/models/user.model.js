import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: false
    },
    githubid: {
        type: String,
    },
    password: {
        type: String,
        // required: function () { return !this.githubid || false; }
        required: false
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
