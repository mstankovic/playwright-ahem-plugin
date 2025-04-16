import { request } from './client';
import { config } from './config';
import { EmailSummary } from './types';

export async function listEmails(mailbox?: string): Promise<EmailSummary[]> {
  const mbox = mailbox || config.defaultMailbox;
  return request(`/api/mailbox/${mbox}/email`);
}

export async function deleteMailbox(mailbox: string): Promise<void> {
  await request(`/api/mailbox/${mailbox}`, 'DELETE');
}
