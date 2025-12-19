/**
 * Extracts the base domain from a URL, removing any subdomains
 * @param url The full URL
 * @returns The base URL without subdomains
 */
export function getBaseUrlWithoutSubdomain(url: string): string {
  try {
    // Parse the URL
    const parsedUrl = new URL(url);

    // Extract hostname parts
    const hostnameParts = parsedUrl.hostname.split('.');

    // For localhost or IP addresses, return the full URL as is
    if (parsedUrl.hostname === 'localhost' || isIpAddress(parsedUrl.hostname)) {
      return url;
    }

    // If the hostname has more than 2 parts (e.g. 'api.example.com'),
    // keep only the last two parts (e.g. 'example.com')
    let baseHostname = parsedUrl.hostname;
    if (hostnameParts.length > 2) {
      // For cases like 'subdomain.example.com', keep 'example.com'
      // For cases like 'sub.subdomain.example.com', keep 'example.com'
      baseHostname = hostnameParts.slice(-2).join('.');
    }

    // Reconstruct the URL with the base hostname
    return `${parsedUrl.protocol}//${baseHostname}${parsedUrl.port ? ':' + parsedUrl.port : ''}`;
  } catch (error) {
    console.warn('Invalid URL provided to getBaseUrlWithoutSubdomain, returning original URL:', url);
    return url; // Return original URL if parsing fails
  }
}

/**
 * Checks if a hostname is an IP address
 * @param hostname The hostname to check
 * @returns True if it's an IP address
 */
function isIpAddress(hostname: string): boolean {
  // Regular expression to match IP address format
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  return ipRegex.test(hostname);
}


/**
 * Alternative implementation that keeps specific known subdomains like 'www'
 */
export function getBaseUrlWithoutSubdomainAdvanced(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    
    // Common domains that we might want to preserve even if technically subdomains
    const knownSubdomains = ['www', 'api', 'app', 'admin', 'staging', 'dev'];
    
    const hostnameParts = hostname.split('.');
    
    // If it's a 2-part domain like example.com, return as is
    if (hostnameParts.length <= 2) {
      return url;
    }
    
    // If it's a 3-part domain with a known subdomain, return the base domain
    if (hostnameParts.length === 3 && knownSubdomains.includes(hostnameParts[0])) {
      const baseHostname = hostnameParts.slice(-2).join('.');
      return `${parsedUrl.protocol}//${baseHostname}${parsedUrl.port ? ':' + parsedUrl.port : ''}`;
    }
    
    // For more complex cases or unknown subdomains, get the base domain
    const baseHostname = hostnameParts.slice(-2).join('.');
    return `${parsedUrl.protocol}//${baseHostname}${parsedUrl.port ? ':' + parsedUrl.port : ''}`;
  } catch (error) {
    console.warn('Invalid URL provided to getBaseUrlWithoutSubdomainAdvanced, returning original URL:', url);
    return url;
  }
}