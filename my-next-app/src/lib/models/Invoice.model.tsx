import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },
    date: {
        type: String,
        required: true,
    },
    epfNumber: {
        type: String,
        default: null,
        sparse: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    customerDetails: {
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
        },
        email: {
            type: String,
            required: true,
        },
    },
    items: [{
        id: Number,
        name: {
            type: String,
            required: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
        },
        price: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            default: 0,
        }
    }],
    isPaid: {
        type: Boolean,
        required: true,
        default: false,
    },
    total: {
        type: Number,
        default: 0,
    },
    isCancelled: {
        type: Boolean,
        default: false,
    },
    notes: {
        type: String,
        default: "",
    }
});

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export default Invoice;