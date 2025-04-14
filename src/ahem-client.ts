import axios from 'axios';
import { Email, EmailFilterOptions } from './types';

export class AhemClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async listEmails(): Promise<Email[]> {
    const response = await axios.get(`${this.baseUrl}/api/emails`);
    return response.data;
  }

  async getEmail(id: string): Promise<Email> {
    const response = await axios.get(`${this.baseUrl}/api/emails/${id}`);
    return response.data;
  }

  async searchEmails(options: EmailFilterOptions): Promise<Email[]> {
    const response = await axios.get(`${this.baseUrl}/api/emails/search`, {
      params: options
    });
    return response.data;
  }

  async waitForEmail(
    options: EmailFilterOptions,
    timeout: number = 30000,
    pollInterval: number = 1000
  ): Promise<Email> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const emails = await this.searchEmails(options);
      if (emails.length > 0) {
        return emails[0];
      }
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Timeout waiting for email matching criteria`);
  }

  async deleteEmail(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/api/emails/${id}`);
  }

  async deleteAllEmails(): Promise<void> {
    await axios.delete(`${this.baseUrl}/api/emails`);
  }
}