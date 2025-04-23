import { getCustomers } from "@/lib/controllers/customerControllers/Customer.controllers";

export const GET = async () => {
  try {
    const customers = await getCustomers();
    return new Response(JSON.stringify(customers), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch customers", { status: 500 });
  }
};
