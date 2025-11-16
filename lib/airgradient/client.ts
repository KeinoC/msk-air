import { ORPCError } from '@orpc/server';

const API_BASE_URL = 'https://api.airgradient.com/public/api/v1';

export class AirGradientClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getApiToken(): string {
    const token = process.env.AIR_GRADIENT_API_TOKEN?.trim();
    if (!token) {
      throw new Error('AIR_GRADIENT_API_TOKEN environment variable is not set');
    }
    return token;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      query?: Record<string, string | number | boolean | undefined>;
    }
  ): Promise<T> {
    const url = new URL(`${this.baseURL}${path}`);

    const queryParams: Record<string, string | number | boolean | undefined> = {
      token: this.getApiToken(),
      ...options?.query,
    };

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (options?.body && method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url.toString(), config);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new ORPCError(this.getErrorCode(response.status), {
          message: `Air Gradient API error: ${errorText}`,
        });
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }

      return {} as T;
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: `Failed to communicate with Air Gradient API: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  private getErrorCode(status: number): string {
    if (status === 401 || status === 403) {
      return 'UNAUTHORIZED';
    }
    if (status === 404) {
      return 'NOT_FOUND';
    }
    if (status >= 400 && status < 500) {
      return 'BAD_REQUEST';
    }
    if (status >= 500) {
      return 'INTERNAL_SERVER_ERROR';
    }
    return 'INTERNAL_SERVER_ERROR';
  }

  async get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>('GET', path, { query });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, { body });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, { body });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

let clientInstance: AirGradientClient | null = null;

export function getAirGradientClient(): AirGradientClient {
  if (!clientInstance) {
    clientInstance = new AirGradientClient();
  }
  return clientInstance;
}

export const airGradientClient = getAirGradientClient();

