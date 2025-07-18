import { NextResponse } from 'next/server';

// CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Handle preflight OPTIONS request
export function handleCorsOptions() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Add CORS headers to any NextResponse
export function addCorsHeaders(response: NextResponse) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Create a NextResponse with CORS headers
export function createCorsResponse(data: any, options: { status?: number } = {}) {
  return NextResponse.json(data, {
    status: options.status || 200,
    headers: corsHeaders,
  });
}
