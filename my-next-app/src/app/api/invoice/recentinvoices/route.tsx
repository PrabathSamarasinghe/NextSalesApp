import { getRecentInvoices } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function GET(request: Request) {
  try {
    const response = await getRecentInvoices();
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error: unknown) {
    return new Response((error as Error).message, {
      status: 500,
    });
  }
}