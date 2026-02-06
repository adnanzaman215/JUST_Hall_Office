import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Get the authorization header
    const authorization = request.headers.get('authorization');
    
    // Forward the request to Django backend
    const response = await fetch('http://localhost:8000/api/users/auth/upload-profile-picture', {
      method: 'POST',
      headers: {
        'Authorization': authorization || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Upload failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload profile picture API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}