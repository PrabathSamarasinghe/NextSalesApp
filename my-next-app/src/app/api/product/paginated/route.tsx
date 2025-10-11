import { getProductsPaginated } from "@/lib/controllers/productConrollers/product.controllers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortField = searchParams.get('sortField') || 'name';
    const sortDirection = (searchParams.get('sortDirection') || 'asc') as 'asc' | 'desc';

    const result = await getProductsPaginated({
      page,
      limit,
      search,
      category,
      sortField,
      sortDirection
    });

    if ('status' in result && result.status === 500) {
      return new Response(JSON.stringify({ error: result.message }), { status: 500 });
    }

    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
