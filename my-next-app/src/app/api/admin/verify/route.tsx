import { changeAdminStatus } from "@/lib/controllers/adminControllers/Admin.controllers";

export const POST = async (request: Request) => {
    try {
        const { userId, isVerified } = await request.json();
        const updatedAdmin = await changeAdminStatus(userId, isVerified);
        return new Response(JSON.stringify(updatedAdmin), { status: 200 });
    } catch (error: unknown) {
        console.error("Error updating admin status:", error); 
        return new Response("Failed to update admin status", { status: 500 });
    }
};