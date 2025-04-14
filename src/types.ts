export interface Email {
    id: string;
    from: string;
    to: string[];
    subject: string;
    text?: string;
    html?: string;
    headers: Record<string, string>;
    receivedAt: string;
  }
  
  export interface EmailFilterOptions {
    from?: string;
    to?: string;
    subject?: string;
    textContains?: string;
    htmlContains?: string;
    receivedAfter?: Date;
    limit?: number;
  }
  
  export interface AhemPluginConfig {
    baseUrl?: string;
    defaultTimeout?: number;
    pollInterval?: number;
    cleanupAfterTest?: boolean;
  }