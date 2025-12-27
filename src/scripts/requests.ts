let apiConfig: ApiConfig = {
  baseUrl: 'http://localhost:1024',
  timeout: 5000,
};

export function setApiConfig(config: Partial<ApiConfig>) {
  apiConfig = { ...apiConfig, ...config };
}

export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
}

export interface BasicResponse {
  success: boolean;
}

export async function fetchJson<TReq, TRes>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: TReq,
  config: Partial<ApiConfig> = {}
): Promise<TRes> {
  const finalConfig = { ...apiConfig, ...config };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), finalConfig.timeout);

  const headers: HeadersInit = {
    'Content-Type': 'application/json; charset=utf-8',
  };

  const requestOptions: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };

  if (data !== undefined && !['GET', 'DELETE'].includes(method)) {
    (requestOptions as any).body = JSON.stringify(data);
  }

  try {
    const url = `${finalConfig.baseUrl}${path}`;
    const response = await fetch(url, requestOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorDetail}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};
