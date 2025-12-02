import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    console.log('🔗 Register Proxy: Forwarding registration request to backend...');
    console.log('📦 Register Proxy: Request body:', body);

    // Forward the request to the .NET backend
    const backendUrl = 'http://localhost:8000/api/users/auth/register';
    console.log('🎯 Register Proxy: Sending to:', backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📡 Register Proxy: Backend response status:', backendResponse.status);
    console.log('📡 Register Proxy: Backend response headers:', backendResponse.headers.get('content-type'));

    // Read response text first
    const responseText = await backendResponse.text();
    console.log('📡 Register Proxy: Backend response text:', responseText);

    if (!backendResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText || 'Unknown error from backend' };
      }
      console.log('❌ Register Proxy: Backend error:', errorData);
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      console.error('❌ Register Proxy: Failed to parse backend response as JSON');
      return NextResponse.json(
        { error: 'Invalid response from backend', details: responseText },
        { status: 500 }
      );
    }

    console.log('✅ Register Proxy: Registration successful:', responseData);

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('💥 Register Proxy: Error forwarding request:', error);
    console.error('💥 Register Proxy: Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        error: 'Proxy server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to connect to backend. Please ensure the backend server is running on http://localhost:8000'
      },
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