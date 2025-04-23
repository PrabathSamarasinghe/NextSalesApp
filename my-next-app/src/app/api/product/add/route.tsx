import { addProduct } from "@/lib/controllers/productConrollers/product.controllers";

export const POST = async (request: Request) => {
  try {
    const productData = await request.json();
    const newProduct = await addProduct(productData);
    return new Response(JSON.stringify(newProduct), { status: 201 });
  } catch (error) {
    return new Response("Failed to create product", { status: 500 });
  }
};