import mongoose from "mongoose"


const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error: unknown) {
        console.error(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
        process.exit(1);
    }
}
export default connectDB;

