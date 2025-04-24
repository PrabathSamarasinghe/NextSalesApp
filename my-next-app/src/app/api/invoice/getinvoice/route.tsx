import { getInvoiceById } from "@/lib/controllers/invoiceControllers/Invoice.controllers";


export async function POST(
  request: Request,
) {
  try {
    const { invoiceId } = await request.json();
    if (!invoiceId) {
      return new Response("Invoice ID is required", { status: 400 });
    }

    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      return new Response("Invoice not found", { status: 404 });
    }

    return new Response(JSON.stringify(invoice), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
