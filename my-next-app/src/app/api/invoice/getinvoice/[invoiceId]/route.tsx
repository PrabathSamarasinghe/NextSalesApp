import { getInvoiceById } from "@/lib/controllers/invoiceControllers/Invoice.controllers";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params;
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
