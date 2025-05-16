import { cancelInvoice } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function POST(request: Request) {
    const { invoiceId } = await request.json();
    const response = await cancelInvoice(invoiceId);
    return new Response(JSON.stringify(response), {
        status: response.status,
    });
}