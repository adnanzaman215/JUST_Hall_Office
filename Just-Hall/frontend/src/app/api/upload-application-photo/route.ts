import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Forward the request to .NET backend
    const response = await fetch('http://localhost:8000/api/applications/upload-application-photo', {
      method: 'POST',
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
    console.error('Upload application photo API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    // Return the URL path (relative to backend media folder)
    const profilePhotoUrl = `/media/profile_photos/${filename}`;
    
    return NextResponse.json({ profilePhotoUrl });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
