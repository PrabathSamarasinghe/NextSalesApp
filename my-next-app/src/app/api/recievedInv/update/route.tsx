import { updateRecievedInvoice } from "@/lib/controllers/recievedControllers/recieved.controllers";

export async function POST(request: Request) {
    const body = await request.json();
    const { invoiceId, invoiceData } = body;

    try {
        const result = await updateRecievedInvoice(invoiceId, invoiceData);
        return new Response(JSON.stringify(result), { status: result.status });
    } catch (error: unknown) {
        return new Response((error as Error).message, { status: 500 });
    }
}