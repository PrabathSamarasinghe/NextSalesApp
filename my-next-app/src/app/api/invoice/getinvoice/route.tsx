import { getInvoiceById } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const invoice = await getInvoiceById(id);
    if (!invoice) {
      return new Response("Invoice not found", { status: 404 });
    }
    return new Response(JSON.stringify(invoice), { status: 200 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
