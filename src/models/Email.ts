import type { AhemEmailFull } from '../types';
import { AhemClient } from '../api/ahemClient';

export class Email {
  constructor(
    public raw: AhemEmailFull,
    private mailbox: string = 'inbox'
  ) {}

  extractLink(regex: RegExp = /https?:\/\/\S+/): string {
    const content = this.raw.html || this.raw.text || '';
    const match = content.match(regex);
    if (!match) throw new Error('No link found in email body.');
    return match[0];
  }

  async markAsRead() {
    const client = new AhemClient(this.mailbox);
    await client.markAsRead(this.raw._id);
  }

  async delete() {
    const client = new AhemClient(this.mailbox);
    await client.deleteEmail(this.raw._id);
  }
}
