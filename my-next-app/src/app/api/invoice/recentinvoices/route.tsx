import { getRecentInvoices } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function GET(request: Request) {
  try {
    const response = await getRecentInvoices();
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch recent invoices" }), {
      status: 500,
    });
  }
}