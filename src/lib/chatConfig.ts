export interface ChatApiConfig {
  baseUrl: string;
  apiKey: string;
}

export const CHAT_API_CONFIG: ChatApiConfig = {
  baseUrl: import.meta.env.VITE_API_URL ?? '',
  apiKey: import.meta.env.VITE_API_KEY ?? '',
};
