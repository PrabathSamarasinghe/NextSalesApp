import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        default: null,
    },
    phone: {
        type: String,
        default: null,
        sparse: true,
    },
    email: {
        type: String,
        default: null,
    },
    epfNumber: {
        type: String,
        default: null,
        sparse: true,
    },
});

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
export default Customer;
