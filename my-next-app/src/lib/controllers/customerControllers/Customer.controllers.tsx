import Customer from "@/lib/models/Customer.model";
import connectDB from "@/lib/db";

export const getCustomers = async () => {
  try {
    await connectDB();
    const customers = await Customer.find({});
    return customers;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};

export const getCustomerById = async (customerId: string) => {
  try {
    await connectDB();
    const customer = await Customer.findById(customerId);

    
    return customer;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};

export const createCustomer = async (customerData: any) => {
  try {
    await connectDB();
    const customer = new Customer(customerData);
    await customer.save();
    return customer;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};
    