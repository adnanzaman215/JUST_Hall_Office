import { NextRequest, NextResponse } from 'next/server';
import FormData from 'form-data';
import { Readable } from 'stream';

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
      const formData = await request.formData();
      
      // Create a new FormData for sending to backend
      const backendFormData = new FormData();
      
      // Iterate through all form entries
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          // Handle file uploads
          console.log(`📁 Adding file: ${key} (${value.name})`);
          const buffer = await value.arrayBuffer();
          backendFormData.append(key, Readable.from(Buffer.from(buffer)), value.name);
        } else {
          // Handle regular form fields
          console.log(`📝 Adding field: ${key} = ${value}`);
          backendFormData.append(key, value);
        }
      }
      
      body = backendFormData;
      // Get headers from FormData (includes Content-Type with boundary)
      headers = backendFormData.getHeaders();
      console.log('📦 FormData headers:', Object.keys(headers));
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

    // Forward the request to the backend
    const backendResponse = await fetch('http://localhost:8000/api/users/auth/complete-profile', {
      method: 'POST',
      headers: headers,
      body: body,
    });

    console.log('📡 Proxy: Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      let errorData;
      const contentType = backendResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        errorData = await backendResponse.json();
      } else {
        // Backend returned HTML error page
        const errorText = await backendResponse.text();
        console.log('❌ Proxy: Backend error (non-JSON):', errorText.substring(0, 500));
        errorData = { 
          error: 'Server error', 
          message: 'The backend returned an error. Check backend logs for details.',
          details: errorText.substring(0, 200)
        };
      }
      
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