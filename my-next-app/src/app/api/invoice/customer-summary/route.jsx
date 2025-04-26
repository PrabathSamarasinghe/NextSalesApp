import { customerSummary } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function POST(request) {
  const { customerId } = await request.json();
  try {
    const data = await customerSummary(customerId);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}