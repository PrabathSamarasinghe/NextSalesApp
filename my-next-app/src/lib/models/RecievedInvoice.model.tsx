import mongoose from "mongoose";

const RecievedInvoiceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    invoiceNumber: {
        type: String,
        required: true,
    },
    supplier: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        default: "",
    },
    total: {
        type: Number,
        default: 0,
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
}, { timestamps: true });

const RecievedInvoice = mongoose.models.RecievedInvoice || mongoose.model("RecievedInvoice", RecievedInvoiceSchema);
export default RecievedInvoice;