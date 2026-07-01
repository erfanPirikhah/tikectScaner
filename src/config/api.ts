export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://takhfinet.com/wp-json/takhfifanbizpwa/v1";

export function buildApiUrl(endpoint: string): string {
  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.replace(/^\/+/, "");

  return `${cleanBaseUrl}/${cleanEndpoint}`;
}
