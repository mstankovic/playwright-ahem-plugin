import axios from 'axios';
import { Email, EmailFilterOptions, AhemPluginConfig } from './types';

export class AhemClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  // Authentication
  async authenticate(): Promise<void> {
    const response = await axios.post(`${this.baseUrl}/api/auth/authenticate`, {});
    this.authToken = response.data.token;
  }

  // Mailbox Operations
  async listMailboxes(prefix?: string): Promise<string[]> {
    const response = await axios.post(`${this.baseUrl}/api/mailbox/autocomplete`, {
      prefix: prefix || ''
    });
    return response.data;
  }

  async deleteMailbox(mailbox: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/api/mailbox/${encodeURIComponent(mailbox)}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Email Operations
  async listEmails(mailbox: string): Promise<Email[]> {
    const response = await axios.get(`${this.baseUrl}/api/mailbox/${encodeURIComponent(mailbox)}/email`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getEmail(mailbox: string, emailId: string): Promise<Email> {
    const response = await axios.get(
      `${this.baseUrl}/api/mailbox/${encodeURIComponent(mailbox)}/email/${emailId}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async markAsRead(mailbox: string, emailId: string, read: boolean = true): Promise<void> {
    await axios.patch(
      `${this.baseUrl}/api/mailbox/${encodeURIComponent(mailbox)}/email/${emailId}`,
      { isRead: read },
      { headers: this.getAuthHeaders() }
    );
  }

  async deleteEmail(mailbox: string, emailId: string): Promise<void> {
    await axios.delete(
      `${this.baseUrl}/api/mailbox/${encodeURIComponent(mailbox)}/email/${emailId}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Attachments
  async getAttachment(
    mailbox: string,
    emailId: string,
    filename: string
  ): Promise<ArrayBuffer> {
    const response = await axios.get(
      `${this.baseUrl}/api/mailbox/${encodeURIComponent(mailbox)}/email/${emailId}/attachments/${filename}`,
      {
        headers: this.getAuthHeaders(),
        responseType: 'arraybuffer'
      }
    );
    return response.data;
  }

  // Search with filtering
  async searchEmails(mailbox: string, options: EmailFilterOptions): Promise<Email[]> {
    const allEmails = await this.listEmails(mailbox);
    return allEmails.filter(email => {
      if (options.from && !email.from.includes(options.from)) return false;
      if (options.to && !email.to.some(to => to.includes(options.to!))) return false;
      if (options.subject && !email.subject.includes(options.subject)) return false;
      if (options.textContains && !email.text?.includes(options.textContains)) return false;
      if (options.receivedAfter && new Date(email.receivedAt) < options.receivedAfter) return false;
      return true;
    });
  }

  // Helper Methods
  private getAuthHeaders() {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }

  // System Info
  async getSystemProperties(): Promise<Record<string, any>> {
    const response = await axios.get(`${this.baseUrl}/api/properties`);
    return response.data;
  }
}