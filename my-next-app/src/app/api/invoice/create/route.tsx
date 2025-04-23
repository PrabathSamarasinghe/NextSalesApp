import { createInvoice } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function POST(request: Request) {
  const body = await request.json();
  const  invoice  = body;
  try {
    const newInvoice = await createInvoice(invoice);
    return new Response(JSON.stringify(newInvoice), { status: 201 });
  } catch (error) {
    return new Response("Error creating invoice", { status: 500 });
  }
}
