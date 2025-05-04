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
    const product = await Product.findByIdAndUpdate(id, { ...productData, entireStock: prevProduct.entireStock }, { new: true });
    return product;
  } catch (error: unknown) {
    return { 
        status: 500, 
         message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
}
}