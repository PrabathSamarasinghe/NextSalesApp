import Product from "@/lib/models/Product.model";
import connectDB from "@/lib/db";

export async function getProducts() {
  try {
    await connectDB();
    const products = await Product.find({});
    return products;
  } catch (error: any) {
    return { 
        status: 500, 
        message: error.message 
    };
}
};

export async function addProduct(productData: any) {
  try {
    await connectDB();
    const product = new Product(productData);
    await product.save();
    return product;
  } catch (error: any) {
    return { 
        status: 500, 
        message: error.message 
    };
}
}

export async function deleteProduct(id: string) {
  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    return product;
  } catch (error: any) {
    return { 
        status: 500, 
        message: error.message 
    };
}
}

export async function updatedProduct(id: string, productData: any) {
  try {
    await connectDB();
    const product = await Product.findByIdAndUpdate(id, productData, { new: true });
    return product;
  } catch (error: any) {
    return { 
        status: 500, 
        message: error.message 
    };
}
}