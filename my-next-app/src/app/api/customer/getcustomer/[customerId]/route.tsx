import { NextRequest } from "next/server";
import { getCustomerById } from "@/lib/controllers/customerControllers/Customer.controllers"; // or wherever you import it from

export const GET = async (req: NextRequest, { params }: { params: { customerId: string } }) => {
  try {
    const { customerId } = await params;
    if (!customerId) {
      return new Response("Customer ID is required", { status: 400 });
    }
    const customer = await getCustomerById(customerId);
    if (!customer) {
      return new Response("Customer not found", { status: 404 });
    }
    return new Response(JSON.stringify(customer), { status: 200 });
  } catch (error) {
    console.error("Error fetching customer:", error);
    return new Response("Failed to fetch customer", { status: 500 });
  }
};
