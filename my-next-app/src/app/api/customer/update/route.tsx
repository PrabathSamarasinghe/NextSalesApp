import { updateCustomer } from '@/lib/controllers/customerControllers/Customer.controllers';

export async function POST(request: Request) {
    try {
        const { customerId, customerData } = await request.json();
        const updatedCustomer = await updateCustomer(customerId, customerData);
        return new Response(JSON.stringify(updatedCustomer), {
        status: 200,
        });
    } catch (error: unknown) {
        console.error("Error updating customer:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}