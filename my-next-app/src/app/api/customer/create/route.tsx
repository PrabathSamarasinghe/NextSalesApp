import { createCustomer } from "@/lib/controllers/customerControllers/Customer.controllers";

export const POST = async (request: Request) => {
  try {
    const customerData = await request.json();
    const newCustomer = await createCustomer(customerData);
    return new Response(JSON.stringify(newCustomer), { status: 201 });
  } catch (error: unknown) {
    return new Response((error as Error).message, { status: 500 });
  }
};
