import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to get base domain without subdomain
export function getBaseDomain(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Split the hostname into parts
    const parts = hostname.split('.');

    // If it has more than 2 parts (e.g., sub.domain.com), return the last two parts
    if (parts.length > 2) {
      // Special handling for domains like .co.uk, .com.au, etc.
      if ((parts[parts.length - 1] === 'uk' && parts[parts.length - 2] === 'co') ||
          (parts[parts.length - 1] === 'au' && parts[parts.length - 2] === 'com') ||
          (parts[parts.length - 1] === 'ir' && parts[parts.length - 2] === 'co')) {
        // Return the last 3 parts for these special cases
        return parts.slice(-3).join('.');
      }
      // Return the last 2 parts (e.g., domain.com)
      return parts.slice(-2).join('.');
    }

    // For domains with 2 or fewer parts (e.g., example.com), return as is
    return hostname;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return url; // Return original URL if parsing fails
  }
}

// Function to get domain without subdomain while preserving protocol
export function getBaseUrlWithoutSubdomain(fullUrl: string): string {
  try {
    const parsedUrl = new URL(fullUrl);
    const baseDomain = getBaseDomain(fullUrl);

    // Preserve the protocol (http/https) and rebuild the URL
    parsedUrl.hostname = baseDomain;
    return parsedUrl.origin;
  } catch (error) {
    console.error('Error processing URL:', error);
    return fullUrl; // Return original URL if processing fails
  }
}
