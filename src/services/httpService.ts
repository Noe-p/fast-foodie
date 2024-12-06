import axios, { AxiosInstance } from 'axios';

class HTTPService {
  private httpUrl: AxiosInstance | null;
  private baseURL: string;
  private timeout: number;
  private token: string;

  constructor() {
    this.httpUrl = null;
    this.baseURL = `${process.env.NEXT_PUBLIC_API_URL}`;
    this.timeout = process.env.NEXT_PUBLIC_API_TIMEOUT
      ? +process.env.NEXT_PUBLIC_API_TIMEOUT
      : 3000;
    this.token = '';
  }

  public setToken(token: string) {
    this.token = token;
    this.httpUrl = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get(...args: any) {
    return this.call('get', args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public post(...args: any) {
    return this.call('post', args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public patch(...args: any) {
    return this.call('patch', args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public delete(...args: any) {
    return this.call('delete', args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public put(...args: any) {
    return this.call('put', args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async call(method: keyof AxiosInstance, ...args: any) {
    if (!this.httpUrl || Object.keys(this.httpUrl).length === 0) {
      this.httpUrl = this.createNewAxios();
    }
    const myAxiosInstance = this.httpUrl;

    // eslint-disable-next-line @typescript-eslint/ban-types
    const response = await (myAxiosInstance[method] as Function).apply(
      this,
      ...args
    );
    if (response.status >= 400) {
      // eslint-disable-next-line no-console
      console.error('[DEBUG] response', response);
      throw response;
    }

    return response;
  }

  createNewAxios() {
    let headers = {};

    if (this.token && this.token !== '') {
      headers = {
        ...headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    headers = { ...headers, 'x-api-key': process.env.NEXT_PUBLIC_API_KEY };
    return axios.create({
      headers,
      baseURL: this.baseURL,
      transformResponse: [this.handleResponse],
      timeout: this.timeout,
      validateStatus: (status: number) => status >= 200 && status < 500,
    });
  }

  // TODO: Define an error standard
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleResponse(response: any) {
    if (response.status >= 400) {
      throw new Error('');
    }
    // ici
    if (!response) return {};
    return JSON.parse(response);
  }
}

export const HttpService = new HTTPService();
