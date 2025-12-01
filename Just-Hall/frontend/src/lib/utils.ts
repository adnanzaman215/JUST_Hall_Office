// Utility function to construct full media URLs from relative paths
export function getFullMediaUrl(relativePath?: string | null): string | null {
  if (!relativePath) return null;
  
  // If it's already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Construct full URL
  const baseUrl = 'http://localhost:8000';
  return `${baseUrl}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
}