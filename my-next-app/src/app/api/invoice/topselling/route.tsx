import { getTopSellingProducts } from "@/lib/controllers/invoiceControllers/Invoice.controllers";

export async function GET() {
  try {
    const topSellingProducts = await getTopSellingProducts();
    return new Response(JSON.stringify(topSellingProducts), {
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Error fetching top selling products:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
