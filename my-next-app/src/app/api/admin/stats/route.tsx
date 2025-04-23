import { getStatistics } from "@/lib/controllers/adminControllers/Admin.controllers";

export async function GET() {
    const response = await getStatistics();
    return new Response(JSON.stringify(response), {
        status: response.status,
    });
}