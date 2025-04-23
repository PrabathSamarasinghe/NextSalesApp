import { getProducts } from "@/lib/controllers/productConrollers/product.controllers";

export const GET = async () => {
  try {
    const products = await getProducts();
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching products:", error);
    return new Response("Failed to fetch products", { status: 500 });
  }
};