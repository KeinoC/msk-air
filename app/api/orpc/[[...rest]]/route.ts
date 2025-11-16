import { RPCHandler } from '@orpc/server/fetch';
import { apiRouter } from '@/lib/orpc/router';
import { NextRequest } from 'next/server';

const handler = new RPCHandler(apiRouter, {});

async function handleRequest(request: NextRequest) {
  try {
    // Clone the request to ensure body is accessible
    const clonedRequest = request.clone();
    
    // Get body text if it exists
    let bodyText: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        bodyText = await clonedRequest.text();
        console.log('Request body text:', bodyText);
        console.log('Request URL:', request.url);
        console.log('Request pathname:', new URL(request.url).pathname);
      } catch (e) {
        console.error('Error reading cloned request body:', e);
        // Body might already be consumed, try original request
        try {
          bodyText = await request.text();
        } catch (e2) {
          console.error('Error reading original request body:', e2);
        }
      }
    }
    
    // Create a new Request with the body properly set
    // Use the original URL but ensure body is accessible
    const fetchRequest = bodyText 
      ? new Request(request.url, {
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          body: bodyText,
        } as RequestInit)
      : new Request(request.url, {
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
        });
    
    console.log('FetchRequest body:', fetchRequest.body ? 'present' : 'missing');
    console.log('FetchRequest method:', fetchRequest.method);

    const result = await handler.handle(fetchRequest, {
      prefix: '/api/orpc',
      context: {},
    });

    if (result.matched) {
      return result.response;
    }

    return new Response('Not found', { status: 404 });
  } catch (error) {
    console.error('oRPC handler error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export const HEAD = handleRequest;
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;

