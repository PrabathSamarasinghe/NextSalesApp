import { createInvoice } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function POST(request: Request) {
  const body = await request.json();
  const  invoice  = body;
  try {
    const newInvoice = await createInvoice(invoice);
    return new Response(JSON.stringify(newInvoice), { status: 201 });
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}
