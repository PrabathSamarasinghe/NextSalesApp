// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check for authentication token
  const token = request.cookies.get('NextSalesApp')?.value;
  
  // If no token is present, redirect to login
  if (!token) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If token exists, allow the request to proceed
  return NextResponse.next();
}

// This is the critical part - make sure your matcher includes ALL protected paths
export const config = {
  matcher: [
    '/dashboard', 
    '/dashboard/:path*',
    '/customers', 
    '/customers/:path*',
    '/invoices', 
    '/invoices/:path*',
    '/newInvoices', 
    '/newInvoices/:path*',
    '/products', 
    '/products/:path*',
    '/sales-report', 
    '/sales-report/:path*',
    '/customerdata/:path*'
  ],
};