import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    console.log('🔗 Proxy: Forwarding profile completion request to backend...');
    
    // Check if this is a multipart form (file upload) or JSON
    const contentType = request.headers.get('content-type');
    let body: any;
    let headers: Record<string, string> = {};
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData (with file upload)
      console.log('📁 Proxy: Handling file upload with FormData');
      body = await request.formData();
      // Don't set Content-Type for FormData - let fetch handle it
    } else {
      // Handle JSON data
      console.log('📦 Proxy: Handling JSON data');
      body = JSON.stringify(await request.json());
      headers['Content-Type'] = 'application/json';
    }
    
    // Include Authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward the request to the Django backend
    const backendResponse = await fetch('http://localhost:8000/api/users/auth/complete-profile', {
      method: 'POST',
      headers: headers,
      body: body,
    });

    console.log('📡 Proxy: Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.log('❌ Proxy: Backend error:', errorData);
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const responseData = await backendResponse.json();
    console.log('✅ Proxy: Profile completion successful:', responseData);

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('💥 Proxy: Error forwarding request:', error);
    return NextResponse.json(
      { error: 'Proxy server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}