import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    entireStock: {
        type: Number,
        default: 0,
    },
    stock: {
        type: Number,
        required: true,
    },
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;