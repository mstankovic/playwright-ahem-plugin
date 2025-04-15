import 'playwright';

declare module 'playwright' {
  interface UseOptions {
    ahem?: {
      baseUrl: string;
      defaultTimeout: number;
      pollInterval: number;
      defaultMailbox: string;
    };
  }
}
