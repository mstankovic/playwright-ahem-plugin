export interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Attachment[];
  isRead: boolean;
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
  markAsRead?: boolean;
}

export interface AhemPluginConfig {
  baseUrl?: string;
  defaultTimeout?: number;
  pollInterval?: number;
  cleanupAfterTest?: boolean;
  defaultMailbox: string;
}

interface Attachment {
  filename: string;
  contentType: string;
  size: number;
}