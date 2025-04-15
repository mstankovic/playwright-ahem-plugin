import { ahemConfig } from '../config';
import { getToken } from './auth';
import type { AhemEmailMeta, AhemEmailFull } from '../types';

export class AhemClient {
  constructor(private mailbox: string = ahemConfig.defaultMailbox) {}

  private async authorizedFetch(url: string, options: RequestInit = {}) {
    const token = await getToken();
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return fetch(url, { ...options, headers });
  }

  async getEmails(): Promise<AhemEmailMeta[]> {
    const res = await this.authorizedFetch(`${ahemConfig.baseUrl}/api/mailbox/${this.mailbox}/email`);
    return res.json();
  }

  async getEmailContent(emailId: string): Promise<AhemEmailFull> {
    const res = await this.authorizedFetch(`${ahemConfig.baseUrl}/api/mailbox/${this.mailbox}/email/${emailId}`);
    return res.json();
  }

  async markAsRead(emailId: string) {
    await this.authorizedFetch(`${ahemConfig.baseUrl}/api/mailbox/${this.mailbox}/email/${emailId}`, {
      method: 'PATCH',
      body: JSON.stringify({ isRead: true }),
    });
  }

  async deleteEmail(emailId: string) {
    await this.authorizedFetch(`${ahemConfig.baseUrl}/api/mailbox/${this.mailbox}/email/${emailId}`, {
      method: 'DELETE',
    });
  }

  async deleteMailbox() {
    await this.authorizedFetch(`${ahemConfig.baseUrl}/api/mailbox/${this.mailbox}`, {
      method: 'DELETE',
    });
  }
}
