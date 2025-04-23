import { getAdditionalData } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function GET(request: Request) {
  try {
    const {customerId} = await request.json();
    const additionalData = await getAdditionalData(customerId);
    return new Response(JSON.stringify(additionalData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response("Error fetching additional data", { status: 500 });
  }
}
