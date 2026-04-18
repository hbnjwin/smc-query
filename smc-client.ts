export interface Terminal {
  id: string;
  name: string;
  ip: string;
  status: string;
}

export class NetworkError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class BusinessError extends Error {
  constructor(message: string, public code?: number) {
    super(message);
    this.name = 'BusinessError';
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
}

interface SmcClientOptions {
  baseUrl: string;
  username: string;
  password: string;
}

interface SmcAddressBookResponse {
  success: boolean;
  code?: number;
  message?: string;
  data?: Array<{
    id: string;
    name: string;
    ip: string;
    status: string;
  }>;
}

export class SmcClient {
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;

  constructor(options: SmcClientOptions) {
    this.baseUrl = options.baseUrl;
    this.username = options.username;
    this.password = options.password;
  }

  async queryAddressBook(keyword?: string): Promise<Terminal[]> {
    const url = this.buildUrl(keyword);
    const authHeader = this.buildAuthHeader();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new BusinessError(`HTTP error: ${response.status}`, response.status);
      }

      const data: SmcAddressBookResponse = await response.json();

      if (!data.success) {
        throw new BusinessError(data.message || 'Business error', data.code);
      }

      return (data.data || []).map(item => ({
        id: item.id,
        name: item.name,
        ip: item.ip,
        status: item.status,
      }));
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new NetworkError('Network request failed', error);
      }

      throw new NetworkError('Unknown network error');
    }
  }

  private buildUrl(keyword?: string): string {
    const baseEndpoint = `${this.baseUrl}/api/v1/addressbook/terminals`;
    if (keyword) {
      return `${baseEndpoint}?keyword=${encodeURIComponent(keyword)}`;
    }
    return baseEndpoint;
  }

  private buildAuthHeader(): string {
    const credentials = `${this.username}:${this.password}`;
    const encoded = btoa(credentials);
    return `Basic ${encoded}`;
  }
}
