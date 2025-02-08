import { CLOUDINARY_CONFIG } from '../config/cloudinary';

export async function uploadToCloudinary(uri: string) {
  try {
    const formData = new FormData();
    
    // Add file
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);
    
    // Add upload preset
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
} 