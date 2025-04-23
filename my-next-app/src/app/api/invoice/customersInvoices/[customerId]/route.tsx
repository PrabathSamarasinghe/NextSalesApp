import { getInvoicesOfCustomer } from "@/lib/controllers/invoiceControllers/Invoice.controllers";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: { customerId: string } }) => {
  try {
    const { customerId } = await params;
    if (!customerId) {
      return new Response("Customer ID is required", { status: 400 });
    }
    
    const invoices = await getInvoicesOfCustomer(customerId);
    if (!invoices) {
      return new Response("Invoices not found", { status: 404 });
    }
    
    return new Response(JSON.stringify(invoices), { status: 200 });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return new Response("Failed to fetch invoices", { status: 500 });
  }
};
