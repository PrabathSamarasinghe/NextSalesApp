import { getRecievedInvoiceById } from "@/lib/controllers/recievedControllers/recieved.controllers";

export async function POST(request) {
    try {
        const { id } = await request.json();
        const invoice = await getRecievedInvoiceById(id);
        return new Response(JSON.stringify(invoice), { status: 200 });
    } catch (error) {
        console.error("Error fetching invoice by ID:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}