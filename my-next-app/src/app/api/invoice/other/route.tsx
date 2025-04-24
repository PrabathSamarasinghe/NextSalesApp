import { getAdditionalData } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export const POST = async (request : Request) => {
  try {
    const { customerId } = await request.json();
    if (!customerId) {
      return new Response("Customer ID is required", { status: 400 });
    }

    const additionalData = await getAdditionalData(customerId);
    if (!additionalData) {
      return new Response("Additional data not found", { status: 404 });
    }

    return new Response(JSON.stringify(additionalData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching additional data:", error);
    return new Response("Error fetching additional data", { status: 500 });
  }
};
