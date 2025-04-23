import { getAdminCount } from "@/lib/controllers/adminControllers/Admin.controllers";

export async function GET() {
    const response = await getAdminCount();
    return new Response(JSON.stringify(response), {
        status: response.status,
    });
}