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

export const getCustomersPaginated = async ({
  page = 1,
  limit = 10,
  search = '',
  sortField = 'name',
  sortDirection = 'asc'
}: {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}) => {
  try {
    await connectDB();
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection === 'asc' ? 1 : -1;
    
    // Build search query
    const searchQuery = search 
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }
      : {};
    
    // Get total count for pagination
    const total = await Customer.countDocuments(searchQuery);
    
    // Get paginated customers
    const customers = await Customer.find(searchQuery)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return {
      customers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
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