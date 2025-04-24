import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import  Admin  from "@/lib/models/Admin.model";
import Credentials from "@/lib/models/Credentials.model";
import Customers from "@/lib/models/Customer.model";
import Products from "@/lib/models/Product.model";
import Invoice from "@/lib/models/Invoice.model";
import { cookies } from 'next/headers';
import connectDB from "@/lib/db";


export async function loginAdmin(reqBody: { username: string; password: string; }) {
    try {
        await connectDB();
        const { username, password } = reqBody;

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return { status: 401, message: "Invalid username or password" };
        }

        const credentials = await Credentials.findOne({ userId: admin._id });
        if (!credentials) {
            return { status: 401, message: "Invalid username or password" };
        }

        const isPasswordValid = await bcrypt.compare(password, credentials.password);
        if (!isPasswordValid) {
            return { status: 401, message: "Invalid username or password" };
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const cookieStore = cookies();
        (await cookieStore).set('NextSalesApp', token, { httpOnly: true });
        return { status: 200, message: "Login successful" };
    } catch (error: unknown) {
        return { 
            status: 500, 
            message: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}

export async function logoutAdmin() {
    try {
        const cookieStore = cookies();
        (await cookieStore).delete('NextSalesApp');
        return { status: 200, message: "Logout successful" };
    } catch (error: unknown) {
        return { 
            status: 500, 
             message: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}

export async function registerAdmin(reqBody: { firstName: string; lastName: string; username: string; password: string; email: string; }) {
    try {
        await connectDB();
        const { firstName, lastName, username, password, email } = reqBody;

        const existingAdmin = await Admin.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingAdmin) {
            return { 
                status: 400, 
                message: "Username or email already exists" 
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({ 
            firstName, 
            lastName, 
            username, 
            email 
        });
        await newAdmin.save();

        const newCredentials = new Credentials({ 
            userId: newAdmin._id, 
            password: hashedPassword 
        });
        await newCredentials.save();

        return { 
            status: 201, 
            message: "Admin registered successfully" 
        };
    } catch (error: unknown) {
        return { 
            status: 500, 
             message: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}

export async function getStatistics() {
    try {
        await connectDB();
        const totalCustomers = await Customers.countDocuments();
        const totalProducts = await Products.countDocuments();
        const totalInvoices = await Invoice.countDocuments();
        const invoices = await Invoice.find();
        const totalRevenue = invoices.reduce((sum, invoice) => {
            return sum + (invoice.isCancelled ? 0 : Number(invoice.total));
        }, 0);

        return {
            totalCustomers,
            totalProducts,
            totalInvoices,
            totalRevenue
        };
    } catch (error: unknown) {
        return { 
            status: 500, 
             message: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}

export async function getAdminCount() {
    try {
        await connectDB();
        const adminCount = await Admin.countDocuments();
        return adminCount === 0 ? {value: true, status: 200} : {value: false, status: 404};
    } catch (error: unknown) {
        return { 
            status: 500, 
             message: error instanceof Error ? error.message : 'An unknown error occurred'
        };
    }
}