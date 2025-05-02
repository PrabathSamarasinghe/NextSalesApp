import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role:{
        type: String,
        enum: ['admin', 'viewer'],
        default: 'viewer',
    }
},
{
    timestamps: true,
});
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export default Admin;