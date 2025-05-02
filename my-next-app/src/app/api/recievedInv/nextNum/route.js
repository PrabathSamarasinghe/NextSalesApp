import { getNextInvoiceNumber } from "@/lib/controllers/recievedControllers/recieved.controllers";

export async function GET() {
    try {
        const nextInvoiceNumber = await getNextInvoiceNumber();
        return new Response(JSON.stringify(nextInvoiceNumber), { status: 200 });
    } catch (error) {
        console.error("Error fetching next invoice number:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}