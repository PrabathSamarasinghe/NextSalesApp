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

export const createCustomer = async (customerData: {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  epfNumber: string | null;
}) => {
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
    
export const updateCustomer = async (customerId: string, customerData: {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  epfNumber?: string | null;
}) => {
  try {
    await connectDB();
    const customer = await Customer.findByIdAndUpdate(customerId, customerData, { new: true });
    return customer;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};
export const deleteCustomer = async (customerId: string) => {
  try {
    await connectDB();
    const customer = await Customer.findByIdAndDelete(customerId);
    return customer;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
}