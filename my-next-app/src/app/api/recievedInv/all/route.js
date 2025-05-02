import { getRecievedInvoices } from "@/lib/controllers/recievedControllers/recieved.controllers";

export async function GET() {
    try {
        const invoices = await getRecievedInvoices();
        return new Response(JSON.stringify(invoices), { status: 200 });
    } catch (error) {
        return new Response("Internal Server Error", { status: 500 });
    }
}