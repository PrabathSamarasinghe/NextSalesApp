import Product from "@/lib/models/Product.model";
import connectDB from "@/lib/db";

export async function getProducts() {
  try {
    await connectDB();
    const products = await Product.find({});
    return products;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
};

export async function getProductsPaginated({
  page = 1,
  limit = 10,
  search = '',
  category = '',
  sortField = 'name',
  sortDirection = 'asc'
}: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}) {
  try {
    await connectDB();
    
    const skip = (page - 1) * limit;
    const sortOrder = sortDirection === 'asc' ? 1 : -1;
    
    // Build search and filter query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    
    // Get total count for pagination
    const total = await Product.countDocuments(query);
    
    // Get paginated products
    const products = await Product.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return {
      products,
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
}

export async function addProduct(productData: {
  name: string;
  price: number;
  stock: number;
  category: string;
}) {
  try {
    await connectDB();
    const dataToSave = {
      ...productData,
      entireStock: productData.stock,
    }
    const product = new Product(dataToSave);
    await product.save();
    return product;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
}

export async function deleteProduct(id: string) {
  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    return product;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
}

export async function updatedProduct(id: string, productData: {
  name: string;
  price: number;
  stock: number;
  entireStock: number;
  category: string;
}) {
  try {
    await connectDB();
    const prevProduct = await Product.findById(id);
    if (!prevProduct) {
      return { 
        status: 404, 
        message: 'Product not found' 
      };
    }
    const product = await Product.findByIdAndUpdate(id, { ...productData, entireStock: prevProduct.entireStock + (productData.stock === prevProduct.stock ? 0 : productData.stock) }, { new: true });
    return product;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
}