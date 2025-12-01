import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    
    console.log('🔗 Proxy: Forwarding registration request to backend...');
    console.log('📦 Proxy: Request body:', body);

    // Forward the request to the Django backend
    const backendResponse = await fetch('http://localhost:8000/api/users/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📡 Proxy: Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.log('❌ Proxy: Backend error:', errorData);
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const responseData = await backendResponse.json();
    console.log('✅ Proxy: Registration successful:', responseData);

    return NextResponse.json(responseData, { status: 201 });

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