// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Function to decode JWT token without verification
function decodeJwt(token: string) {
  try {
    // Split the token into its parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    // Get the payload part (the middle part)
    const payload = parts[1];
    
    // Base64Url decode the payload
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    // Parse the JSON payload
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    throw new Error('Invalid token format');
  }
}

export async function middleware(request: NextRequest) {
  // Check for authentication token
  const token = request.cookies.get('NextSalesApp')?.value;
  
  // If no token is present, redirect to login
  if (!token) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  try {
    // Decode the JWT token
    const tokenData = decodeJwt(token);
    const { id, role, isVerified } = tokenData;
    
    if (!id || !role || isVerified === undefined) {
      console.error("Invalid token format");
      return NextResponse.redirect(new URL('/', request.url));
    }
        
    const path = request.nextUrl.pathname;

    // Redirect to login if the user is not verified
    if (!isVerified) {
      return NextResponse.redirect(new URL('/not-verified', request.url));
    }

    // Block viewers from accessing specific routes
    if ((path.startsWith('/newInvoice') || path.startsWith('/recieved-invoice')) && role === 'viewer') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', String(id));
    requestHeaders.set('x-user-role', String(role));
    
    // Allow the request to proceed with modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
  } catch (error) {
    console.error("Error decoding token:", error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: [
    '/dashboard', 
    '/dashboard/:path*',
    '/customers', 
    '/customers/:path*',
    '/invoices', 
    '/invoices/:path*',
    '/newInvoices/:path*',
    '/products', 
    '/products/:path*',
    '/sales-report', 
    '/sales-report/:path*',
    '/customerdata/:path*',
    '/newInvoice',
    '/top-sold',
    '/top-sold/:path*',
    '/recieved-invoice',
  ],
};