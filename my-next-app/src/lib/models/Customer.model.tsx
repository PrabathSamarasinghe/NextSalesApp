import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    epfNumber: {
        type: String,
        unique: true,
        default: null,
        sparse: true,
    },
});

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;