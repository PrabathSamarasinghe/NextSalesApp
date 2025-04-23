import Customer from "@/lib/models/Customer.model";
import connectDB from "@/lib/db";

export const getCustomers = async () => {
  try {
    await connectDB();
    const customers = await Customer.find({});
    return customers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
};

export const getCustomerById = async (customerId: string) => {
  try {
    await connectDB();
    const customer = await Customer.findById(customerId);

    
    return customer;
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    throw new Error("Failed to fetch customer");
  }
};

export const createCustomer = async (customerData: any) => {
  try {
    await connectDB();
    const customer = new Customer(customerData);
    await customer.save();
    return customer;
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new Error("Failed to create customer");
  }
};
    