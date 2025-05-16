import { deleteInvoice } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function POST(request: Request) {
    const { invoiceId } = await request.json();
    const response = await deleteInvoice(invoiceId);
    return new Response(JSON.stringify(response || { error: 'Failed to delete invoice' }), {
        status: response?.status || 500,
    });
}