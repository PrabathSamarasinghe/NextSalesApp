import { updatedProduct } from "@/lib/controllers/productConrollers/product.controllers";

export const POST = async (request: Request) => {
  try {
    const { id, ...productData } = await request.json();
    const updatedProductData = await updatedProduct(id, productData);
    return new Response(JSON.stringify(updatedProductData), { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating product:", error); // Log the error for debugging
    return new Response("Failed to update product", { status: 500 });
  }
};
