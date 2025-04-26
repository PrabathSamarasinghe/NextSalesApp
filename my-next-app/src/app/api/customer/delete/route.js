import { deleteCustomer } from "@/lib/controllers/customerControllers/Customer.controllers";

export async function POST(request) {
    const { customerId } = await request.json();
    try {
        const customer = await deleteCustomer(customerId);
        return new Response(JSON.stringify(customer), { status: 200 });
    } catch (error) {
        return new Response("Error deleting customer", { status: 500 , statusText: error.message});
    }
}