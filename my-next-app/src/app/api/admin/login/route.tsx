import { loginAdmin } from "@/lib/controllers/adminControllers/Admin.controllers";

export async function POST(request: Request) {
    const { username, password } = await request.json();
    const response = await loginAdmin({ username, password });
    return new Response(JSON.stringify(response), {
        status: response.status,
    });
}
