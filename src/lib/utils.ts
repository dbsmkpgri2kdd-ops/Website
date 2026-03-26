import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertGoogleDriveLink(url: string): string {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }

  const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  return url;
}

export function convertGoogleDriveLinkForEmbed(url: string): string {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }

  const regex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  return url;
}

export const getDashboardByRole = (role?: string) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'guru':
      return '/guru';
    case 'siswa':
      return '/siswa';
    case 'alumni':
      return '/'; // Alumni stay on the homepage
    default:
      return '/'; // Default to homepage for unknown or no role
  }
};

export const formatDate = (date: any): string => {
  if (!date) {
    return 'Tanggal tidak tersedia';
  }

  // Firestore Timestamps have toDate() method
  const dateObject = date.toDate ? date.toDate() : new Date(date);

  if (isNaN(dateObject.getTime())) {
    return 'Tanggal tidak valid';
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(dateObject);
};
