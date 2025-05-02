import { createRecievedInvoice } from "@/lib/controllers/recievedControllers/recieved.controllers";

export async function POST(request) {
    try {
        const invoiceData = await request.json();
        const newInvoice = await createRecievedInvoice(invoiceData);
        return new Response(JSON.stringify(newInvoice), { status: 201 });
    } catch (error) {
        console.error("Error creating invoice:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}