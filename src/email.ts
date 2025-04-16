import { request } from './client';
import { config } from './config';
import { EmailContent } from './types';

export async function getEmail(emailId: string, mailbox?: string): Promise<EmailContent> {
  const mbox = mailbox || config.defaultMailbox;
  return request(`/api/mailbox/${mbox}/email/${emailId}`);
}

export async function markAsRead(emailId: string, mailbox?: string): Promise<void> {
  const mbox = mailbox || config.defaultMailbox;
  await request(`/api/mailbox/${mbox}/email/${emailId}`, 'PATCH', { isRead: true });
}

export async function deleteEmail(emailId: string, mailbox?: string): Promise<void> {
  const mbox = mailbox || config.defaultMailbox;
  await request(`/api/mailbox/${mbox}/email/${emailId}`, 'DELETE');
}
