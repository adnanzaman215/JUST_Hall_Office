import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔗 Login Proxy: Forwarding login request to backend...');
    console.log('📦 Login Proxy: Request body:', body);
    
    // Forward the request to Django backend
    const response = await fetch('http://localhost:8000/api/users/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('📡 Login Proxy: Backend response status:', response.status);
    console.log('📡 Login Proxy: Backend response headers:', response.headers.get('content-type'));

    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlText = await response.text();
      console.error('❌ Login Proxy: Backend returned HTML instead of JSON:', htmlText.substring(0, 200));
      return NextResponse.json(
        { error: 'Backend returned an error page instead of JSON response' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Login Proxy: Backend error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Login Proxy: Login successful:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Login API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}