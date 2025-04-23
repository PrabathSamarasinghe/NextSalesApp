import { registerAdmin } from "@/lib/controllers/adminControllers/Admin.controllers";

export async function POST(request: Request) {
    const { firstName, lastName, username, password, email } = await request.json();    
    const response = await registerAdmin({ firstName, lastName, username, password, email });
    return new Response(JSON.stringify(response), {
        status: response.status,
    });
}