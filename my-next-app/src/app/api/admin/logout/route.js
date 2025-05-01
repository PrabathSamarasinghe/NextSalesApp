import { logoutAdmin } from "@/lib/controllers/adminControllers/Admin.controllers";

export async function GET() {
    try {
        const response = await logoutAdmin();
        return new Response(JSON.stringify(response), {
            status: response.status,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}