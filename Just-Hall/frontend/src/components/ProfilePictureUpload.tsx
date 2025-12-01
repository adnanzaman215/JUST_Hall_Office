"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { authAPI } from '@/lib/api';
import { getFullMediaUrl } from '@/lib/utils';

interface ProfilePictureUploadProps {
  currentPhotoUrl?: string;
  onUploadSuccess?: (photoUrl: string) => void;
}

export default function ProfilePictureUpload({ 
  currentPhotoUrl, 
  onUploadSuccess 
}: ProfilePictureUploadProps) {
  const { user, token, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(getFullMediaUrl(currentPhotoUrl));

  // Update preview when currentPhotoUrl changes
  useEffect(() => {
    setPreviewUrl(getFullMediaUrl(currentPhotoUrl));
  }, [currentPhotoUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const response = await authAPI.uploadProfilePicture(file, token);
      
      // Update user context with new photo URL
      if (user && response.photo_url) {
        const updatedUser = {
          ...user,
          student_profile: {
            student_id: user.student_profile?.student_id || '',
            department: user.student_profile?.department || '',
            session: user.student_profile?.session || '',
            room_no: user.student_profile?.room_no || 0,
            photo_url: response.photo_url
          }
        };
        updateUser(updatedUser);
        onUploadSuccess?.(response.photo_url);
      }
      
      alert('Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture. Please try again.');
      // Reset preview on error
      setPreviewUrl(currentPhotoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Picture Display */}
      <div className="relative">
        <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          )}
        </div>
        
        {/* Upload Button Overlay */}
        <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <div className="text-white text-center">
            <svg className="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
            </svg>
            <div className="text-xs">
              {uploading ? 'Uploading...' : 'Upload'}
            </div>
          </div>
        </label>
      </div>

      {/* Upload Instructions */}
      <div className="text-sm text-gray-600 text-center">
        <p>Click to upload a profile picture</p>
        <p className="text-xs text-gray-400">Max size: 5MB | Formats: JPG, PNG, GIF</p>
      </div>
    </div>
  );
}