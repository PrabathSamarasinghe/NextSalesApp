import { deleteProduct } from "@/lib/controllers/productConrollers/product.controllers";

export const DELETE = async (request: Request) => {
  try {
    const { id } = await request.json();
    const deletedProduct = await deleteProduct(id);
    return new Response(JSON.stringify(deletedProduct), { status: 200 });
  } catch (error) {
    return new Response("Failed to delete product", { status: 500 });
  }
};