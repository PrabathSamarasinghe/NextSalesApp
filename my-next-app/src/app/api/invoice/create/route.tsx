import { createInvoice } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function POST(request: Request) {
  const body = await request.json();
  const  invoice  = body;
  try {
    const result = await createInvoice(invoice);
    return new Response(JSON.stringify(result), { status: result.status });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ message: (error as Error).message }), { status: 500 });
  }
}
