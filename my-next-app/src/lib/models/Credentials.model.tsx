import mongoose from "mongoose";

const CredentialsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
},
{
    timestamps: true,
});
const Credentials = mongoose.models.Credentials || mongoose.model('Credentials', CredentialsSchema);

export default Credentials;