import { markAsPaid } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function POST(request: Request) {
  const { invoiceId } = await request.json();
  try {
    const response = await markAsPaid(invoiceId);
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to mark as paid" }), {
      status: 500,
    });
  }
}
