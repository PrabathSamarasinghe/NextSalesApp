import { getToken } from "@/lib/controllers/adminControllers/Admin.controllers";

export async function GET() {
    const { status, decoded } = await getToken();
    if (status === 200) {
        return new Response(JSON.stringify({ decoded }), { status });
    } else {
        return new Response(JSON.stringify({ message: "No token found" }), { status });
    }
}