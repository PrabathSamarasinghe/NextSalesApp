import { getAllInvoices } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function GET(request: Request) {
  try {
    const invoices = await getAllInvoices();
    return new Response(JSON.stringify(invoices), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
}
