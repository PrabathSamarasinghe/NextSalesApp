import { getNextInvoiceNumber } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function GET(request: Request) {
  try {
    const nextInvoiceNumber = await getNextInvoiceNumber();
    return new Response(JSON.stringify(nextInvoiceNumber), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}
