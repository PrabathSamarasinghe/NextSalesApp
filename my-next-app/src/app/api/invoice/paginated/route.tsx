import { getInvoicesPaginated } from "@/lib/controllers/invoiceControllers/Invoice.controllers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('statusFilter') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortField = searchParams.get('sortField') || 'date';
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc';

    // Build params object with proper types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {
      page,
      limit,
      search,
      statusFilter,
      sortField,
      sortDirection
    };
    
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const result = await getInvoicesPaginated(params);

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
