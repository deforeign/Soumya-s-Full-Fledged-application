import mongoose from "mongoose";
const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordTokenExpiry: {
        type: Date,
    },
    verifyToken: {
        type: String,
    },
    verifyTokenExpiry: {
        type: Date,
    },
    Amount: {
        type: Number,
        default: 0,
    },
    Cibil: {
        type: Number,
        default: 0,
    },
    upi: {
        type: String,
        default: "",

    },
    paid :{
        type: Boolean,
        default: false,
    },
    sender: {
        type: String,
        default: "",
    },
     paymentTime: {
        type: Date,      
        required: false, 
        default: null,
    },
}, { timestamps: true

})

const User = mongoose.models.users || mongoose.model("users", userSchema);
export default User;