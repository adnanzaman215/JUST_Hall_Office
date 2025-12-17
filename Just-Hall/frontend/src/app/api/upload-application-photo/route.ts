import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('profile_photo') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG and PNG are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 1MB' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Define upload directory (relative to project root)
    const uploadDir = join(process.cwd(), '..', 'backend', 'media', 'profile_photos');
    
    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }
    
    // Convert file to buffer and save
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
