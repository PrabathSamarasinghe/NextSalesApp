import { getAllAdmins } from "@/lib/controllers/adminControllers/Admin.controllers";

export const GET = async () => {
    try {
        const admins = await getAllAdmins();
        return new Response(JSON.stringify(admins), { status: 200 });
    } catch (error: unknown) {
        console.error("Error fetching admins:", error); 
        return new Response("Failed to fetch admins", { status: 500 });
    }
};