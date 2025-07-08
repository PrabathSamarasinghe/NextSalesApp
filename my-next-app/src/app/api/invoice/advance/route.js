import { advancePayment } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function POST(request) {
  try {
    const {invoiceId, paymentData} = await request.json();
    const response = await advancePayment(invoiceId, paymentData);
    return new Response(JSON.stringify(response), { status: response.status || 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

